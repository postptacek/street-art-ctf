import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Marker, useMap, useMapEvents, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGame } from '../context/GameContext'
import { 
  MAP_CENTER, 
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAP_STYLE,
  ART_POINTS,
  TEAMS,
  METRO_B,
  HOODS,
  generateTeamTerritories,
  generateTeamLines,
  calculateTeamScores,
  getTeamColor,
  getPointValue
} from '../data/pragueMap'
import { X, MapPin, Crosshair, Sparkles, Code, RotateCcw, Ghost, Train, Circle, Settings, Square, Hexagon, Minus } from 'lucide-react'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Create custom chumper icons for different team states
const CHUMPER_URL = `${import.meta.env.BASE_URL}chumper.png`

const createChumperIcon = (capturedBy, isGhost = false, isDiscovered = false) => {
  // Determine the CSS filter based on capture state
  let filter = ''
  if (isGhost) {
    filter = 'grayscale(100%) opacity(0.5)'
  } else if (!capturedBy) {
    // Uncaptured - black and white (desaturated)
    filter = 'grayscale(100%)'
  } else if (capturedBy === 'red') {
    // Red team - shift hue (blue to red is roughly 180 degrees)
    filter = 'hue-rotate(160deg) saturate(1.5)'
  }
  // Blue team - no filter needed (original image is blue)
  
  // Add a discovery indicator (purple ring) if discovered by player
  const discoveryIndicator = isDiscovered 
    ? `<div style="position:absolute;inset:-4px;border:2px solid #a855f7;border-radius:50%;"></div>`
    : ''
  
  return L.divIcon({
    html: `<div style="position:relative;">${discoveryIndicator}<img src="${CHUMPER_URL}" style="width: 32px; height: 32px; filter: ${filter};" /></div>`,
    className: 'chumper-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Zoom display component for dev mode
function ZoomDisplay({ devMode }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [center, setCenter] = useState(MAP_CENTER)
  
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
    moveend: (e) => {
      const c = e.target.getCenter()
      setCenter([c.lat.toFixed(6), c.lng.toFixed(6)])
    }
  })
  
  if (!devMode) return null
  
  return (
    <div className="absolute bottom-24 left-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-500/30">
      <div className="text-[10px] font-mono text-purple-400">
        <div>zoom: {zoom}</div>
        <div>lat: {center[0]}</div>
        <div>lng: {center[1]}</div>
      </div>
    </div>
  )
}

// Fly to hood component
function FlyToHood({ hood }) {
  const map = useMap()
  
  useEffect(() => {
    if (hood) {
      map.flyTo(hood.center, hood.zoom, { duration: 1.5 })
    }
  }, [hood, map])
  
  return null
}

// Fly to last capture and show highlight
function LastCaptureHighlight({ onShow }) {
  const map = useMap()
  const [lastCapture, setLastCapture] = useState(null)
  
  useEffect(() => {
    const stored = localStorage.getItem('streetart-ctf-lastCapture')
    if (stored) {
      const data = JSON.parse(stored)
      setLastCapture(data)
      // Clear after reading
      localStorage.removeItem('streetart-ctf-lastCapture')
      // Fly to the location
      if (data.location) {
        setTimeout(() => {
          map.flyTo(data.location, 17, { duration: 1.5 })
          if (onShow) onShow(data)
        }, 500)
      }
    }
  }, [map, onShow])
  
  if (!lastCapture) return null
  
  const color = lastCapture.team === 'red' ? '#ff6b6b' : '#4dabf7'
  
  return (
    <CircleMarker
      center={lastCapture.location}
      radius={30}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 3,
        className: 'capture-pulse'
      }}
    />
  )
}

// Location button component
function LocationButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)
  
  const handleLocate = () => {
    setLocating(true)
    map.locate({ setView: true, maxZoom: 16 })
    setTimeout(() => setLocating(false), 2000)
  }
  
  return (
    <motion.button
      onClick={handleLocate}
      className="absolute bottom-24 right-4 z-[1000] w-12 h-12 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={locating ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: locating ? Infinity : 0 }}
      >
        <Crosshair size={20} className="text-white" />
      </motion.div>
    </motion.button>
  )
}

// Point detail panel
function PointPanel({ point, onClose, isDiscovered, isSoloView }) {
  const teamColor = point.capturedBy ? getTeamColor(point.capturedBy) : '#495057'
  const displayColor = isSoloView 
    ? (isDiscovered ? '#a855f7' : '#495057')
    : teamColor
  const pts = getPointValue(point)
  const isGhost = point.status === 'ghost'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-20 left-4 right-4 z-[1000]"
    >
      <div 
        className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 border"
        style={{ borderColor: `${displayColor}40` }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X size={16} className="text-white/50" />
        </button>
        
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${displayColor}20`, border: `1px solid ${displayColor}40` }}
          >
            {isGhost ? (
              <Ghost size={20} className="text-white/30" />
            ) : isSoloView ? (
              isDiscovered ? <Sparkles size={20} style={{ color: displayColor }} /> : <MapPin size={20} style={{ color: displayColor }} />
            ) : point.capturedBy ? (
              <Sparkles size={20} style={{ color: displayColor }} />
            ) : (
              <MapPin size={20} style={{ color: displayColor }} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">{point.name}</h3>
              {isGhost && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">GHOST</span>
              )}
            </div>
            <p className="text-sm text-white/40">{point.area}</p>
            
            {/* Size and MHD badges */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 capitalize">{point.size}</span>
              {point.mhd && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  point.mhd === 'metroB' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {point.mhd === 'metroB' ? '🚇 Metro B' : '🚋 Tram 12'}
                </span>
              )}
            </div>
            
            {/* Points and status - changes based on view mode */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-bold" style={{ color: displayColor }}>{pts} pts</span>
              {isSoloView ? (
                // Solo view - show discovery status
                isDiscovered ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                    ✓ Discovered
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {isGhost ? 'Gone' : 'Not found yet'}
                  </span>
                )
              ) : (
                // Multi view - show team status
                point.capturedBy ? (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
                  >
                    Team {point.capturedBy}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {isGhost ? 'Gone' : 'Unclaimed'}
                  </span>
                )
              )}
            </div>
            
            {/* Last captured by - only in multi view */}
            {!isSoloView && point.capturedByPlayer && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/40">Last captured by</p>
                <p className="text-sm font-medium text-white mt-0.5">{point.capturedByPlayer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Team cycle for dev mode (null = unclaimed, then cycle through teams)
const TEAM_CYCLE = [null, ...TEAMS]

// Territory modes
const TERRITORY_MODES = [
  { id: 'off', label: 'Off', icon: Minus },
  { id: 'circles', label: 'Circles', icon: Circle },
  { id: 'squares', label: 'Squares', icon: Square },
  { id: 'hexagons', label: 'Hexagons', icon: Hexagon },
]

// Generate territory shapes around captured points
const generateTerritoryShapes = (points, mode) => {
  if (mode === 'off') return []
  
  const capturedPoints = points.filter(p => p.capturedBy && p.status !== 'ghost')
  const shapes = []
  
  capturedPoints.forEach(point => {
    const [lat, lng] = point.location
    const radius = 0.002 // ~200m radius
    const team = point.capturedBy
    
    if (mode === 'circles') {
      // Circle approximation with many sides
      const sides = 32
      const coords = []
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * 2 * Math.PI
        coords.push([
          lat + radius * Math.cos(angle),
          lng + radius * Math.sin(angle) * 1.5 // Adjust for lat/lng ratio
        ])
      }
      shapes.push({ team, coords, pointId: point.id })
    } else if (mode === 'squares') {
      const r = radius * 0.8
      shapes.push({
        team,
        coords: [
          [lat - r, lng - r * 1.5],
          [lat - r, lng + r * 1.5],
          [lat + r, lng + r * 1.5],
          [lat + r, lng - r * 1.5],
        ],
        pointId: point.id
      })
    } else if (mode === 'hexagons') {
      const r = radius * 0.9
      const coords = []
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * 2 * Math.PI + Math.PI / 6
        coords.push([
          lat + r * Math.cos(angle),
          lng + r * Math.sin(angle) * 1.5
        ])
      }
      shapes.push({ team, coords, pointId: point.id })
    }
  })
  
  return shapes
}

// Main Prague Map component
export default function PragueMap() {
  const { player, artPoints, captureArt, discoveries } = useGame()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [devMode, setDevMode] = useState(false)
  const [localArtPoints, setLocalArtPoints] = useState(artPoints)
  const [currentHood, setCurrentHood] = useState(HOODS.vysocany)
  
  // View mode: 'solo' shows only your discoveries, 'multi' shows team captures
  const [viewMode, setViewMode] = useState('solo')
  
  // Map settings
  const [showSettings, setShowSettings] = useState(false)
  const [showLines, setShowLines] = useState(true)
  const [territoryMode, setTerritoryMode] = useState('off')
  
  // Sync with context
  useEffect(() => {
    setLocalArtPoints(artPoints)
  }, [artPoints])
  
  // Dev mode: cycle through teams when clicking a point
  const handlePointClick = (point) => {
    if (devMode) {
      // In dev mode, cycle locally for testing
      setLocalArtPoints(prev => prev.map(p => {
        if (p.id === point.id) {
          const currentIdx = TEAM_CYCLE.indexOf(p.capturedBy)
          const nextIdx = (currentIdx + 1) % TEAM_CYCLE.length
          return { ...p, capturedBy: TEAM_CYCLE[nextIdx] }
        }
        return p
      }))
    } else {
      setSelectedPoint(point)
    }
  }
  
  // Reset local points (dev mode only)
  const handleReset = () => {
    setLocalArtPoints(artPoints.map(p => ({ ...p, capturedBy: null })))
  }
  
  // Use local points for dev mode, context points otherwise
  const displayPoints = devMode ? localArtPoints : artPoints
  
  // Generate lines connecting team points
  const teamLines = useMemo(() => {
    return generateTeamLines(displayPoints)
  }, [displayPoints])
  
  // Generate territory shapes
  const territoryShapes = useMemo(() => {
    return generateTerritoryShapes(displayPoints, territoryMode)
  }, [displayPoints, territoryMode])
  
  // Calculate scores
  const teamScores = useMemo(() => {
    return calculateTeamScores(displayPoints)
  }, [displayPoints])
  
  const totalScore = Object.values(teamScores).reduce((a, b) => a + b, 0) || 1
  
  // Personal discovery stats
  const discoveryCount = Object.keys(discoveries).length
  const totalArtCount = ART_POINTS.length
  
  const isSoloView = viewMode === 'solo'
  
  return (
    <div className="relative w-full h-full">
      {/* View mode toggle */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3">
        <div className="flex bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setViewMode('solo')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isSoloView 
                ? 'bg-purple-500 text-white' 
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            My Collection
          </button>
          <button
            onClick={() => setViewMode('multi')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              !isSoloView 
                ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white' 
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Team Battle
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-black/40 backdrop-blur-sm">
          {isSoloView ? (
            <motion.div
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(discoveryCount / totalArtCount) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          ) : (
            Object.entries(teamScores).map(([team, score]) => {
              const percentage = (score / totalScore) * 100
              return (
                <motion.div
                  key={team}
                  className="h-full"
                  style={{ backgroundColor: getTeamColor(team) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8 }}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend - changes based on view mode */}
      <div className="absolute top-14 left-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        {isSoloView ? (
          <>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Your Collection</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-xs text-white/70">Discovered</span>
                <span className="text-xs text-purple-400 ml-auto font-medium">{discoveryCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/20" />
                <span className="text-xs text-white/50">Not found</span>
                <span className="text-xs text-white/30 ml-auto">{totalArtCount - discoveryCount}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Team Battle</p>
            <div className="space-y-1.5">
              {TEAMS.map(team => (
                <div key={team} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getTeamColor(team) }}
                  />
                  <span className={`text-xs capitalize font-medium ${team === player.team ? 'text-white' : 'text-white/70'}`}>
                    {team} {team === player.team && '(you)'}
                  </span>
                  <span className="text-xs text-white/40 ml-auto">{teamScores[team] || 0}</span>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Transport</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-500" />
            <span className="text-xs text-yellow-500/70">Metro B</span>
          </div>
        </div>
      </div>

      {/* Hood Selector */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-black/80 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        {Object.values(HOODS).map(hood => (
          <motion.button
            key={hood.id}
            onClick={() => setCurrentHood(hood)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentHood.id === hood.id
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {hood.name}
          </motion.button>
        ))}
      </div>

      {/* Map Controls (right side) */}
      <div className="absolute top-10 right-4 z-[1000] flex flex-col gap-2">
        {/* Settings Button */}
        <motion.button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-10 h-10 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-colors ${
            showSettings 
              ? 'bg-white/20 border-white/30 text-white' 
              : 'bg-black/80 border-white/10 text-white/50'
          }`}
          whileTap={{ scale: 0.95 }}
          title="Map Settings"
        >
          <Settings size={18} />
        </motion.button>
        
        {/* Dev Mode */}
        <motion.button
          onClick={() => setDevMode(!devMode)}
          className={`w-10 h-10 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-colors ${
            devMode 
              ? 'bg-purple-500/30 border-purple-500/50 text-purple-400' 
              : 'bg-black/80 border-white/10 text-white/50'
          }`}
          whileTap={{ scale: 0.95 }}
          title="Developer Mode"
        >
          <Code size={18} />
        </motion.button>
        
        {devMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
            whileTap={{ scale: 0.95 }}
            title="Reset All Points"
          >
            <RotateCcw size={18} />
          </motion.button>
        )}
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-24 right-4 z-[1000] w-48 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Display</h3>
            </div>
            
            {/* Show Lines Toggle */}
            <div className="p-3 border-b border-white/5">
              <button
                onClick={() => setShowLines(!showLines)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-sm text-white/70">Show Lines</span>
                <div className={`w-10 h-5 rounded-full transition-colors ${showLines ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full mt-0.5"
                    animate={{ x: showLines ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            </div>
            
            {/* Territory Mode */}
            <div className="p-3">
              <p className="text-xs text-white/40 mb-2">Territory Style</p>
              <div className="grid grid-cols-2 gap-1">
                {TERRITORY_MODES.map(mode => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTerritoryMode(mode.id)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        territoryMode === mode.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={12} />
                      {mode.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Mode Banner */}
      <AnimatePresence>
        {devMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm"
          >
            <span className="text-xs text-purple-400 font-medium">
              DEV MODE — Click points to cycle teams
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: '#0a0a0f' }}
      >
        <TileLayer
          url={MAP_STYLE.tileUrl}
          attribution={MAP_STYLE.attribution}
        />
        
        <LocationButton />
        <ZoomDisplay devMode={devMode} />
        <FlyToHood hood={currentHood} />
        <LastCaptureHighlight />
        
        {/* Metro B line */}
        <Polyline
          positions={METRO_B.map(s => s.location)}
          pathOptions={{
            color: '#eab308',
            weight: 4,
            opacity: 0.5
          }}
        />
        
        {/* Metro B stations */}
        {METRO_B.map(station => (
          <CircleMarker
            key={station.name}
            center={station.location}
            radius={5}
            pathOptions={{
              color: '#eab308',
              fillColor: '#1a1a2e',
              fillOpacity: 1,
              weight: 2
            }}
          />
        ))}
        
        {/* Territory shapes - only in multi view */}
        {!isSoloView && territoryShapes.map((shape, idx) => (
          <Polygon
            key={`territory-${shape.pointId}`}
            positions={shape.coords}
            pathOptions={{
              color: getTeamColor(shape.team),
              fillColor: getTeamColor(shape.team),
              fillOpacity: 0.15,
              weight: 1,
              opacity: 0.4
            }}
          />
        ))}
        
        {/* Team connection lines - only in multi view */}
        {!isSoloView && showLines && Object.entries(teamLines).map(([team, lines]) => 
          lines.map((line, idx) => (
            <Polyline
              key={`${team}-line-${idx}`}
              positions={[line.from, line.to]}
              pathOptions={{
                color: getTeamColor(team),
                weight: 3,
                opacity: 0.6,
                dashArray: null,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          ))
        )}
        
        {/* Art point markers - rendered last (above territories) */}
        {displayPoints.map(point => {
          const isGhost = point.status === 'ghost'
          const isDiscovered = discoveries[point.id]
          // In solo view: show discovered (purple) vs not found (gray)
          // In multi view: show team colors
          const markerTeam = isSoloView 
            ? (isDiscovered ? 'discovered' : null)
            : point.capturedBy
          const icon = createChumperIcon(markerTeam, isGhost, isDiscovered && !isSoloView)
          
          return (
            <Marker
              key={`${point.id}-${markerTeam || 'none'}-${isDiscovered ? 'd' : ''}`}
              position={point.location}
              icon={icon}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation()
                  handlePointClick(point)
                }
              }}
            />
          )
        })}
      </MapContainer>

      {/* Point detail panel */}
      <AnimatePresence>
        {selectedPoint && (
          <PointPanel 
            point={selectedPoint}
            onClose={() => setSelectedPoint(null)}
            isDiscovered={discoveries[selectedPoint.id]}
            isSoloView={isSoloView}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
