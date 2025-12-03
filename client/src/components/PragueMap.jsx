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
import { X, Crosshair, Code, RotateCcw } from 'lucide-react'

const TEAM_CONFIG = {
  red: { color: '#E53935', name: 'RED' },
  blue: { color: '#1E88E5', name: 'BLUE' }
}

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Create custom chumper icons for different team states
const CHUMPER_URL = `${import.meta.env.BASE_URL}chumper.png`

// Calculate decay level (0-1) based on time since capture
// 0 = fresh capture, 1 = fully decayed (24+ hours)
const calculateDecay = (capturedAt) => {
  if (!capturedAt) return 0
  const now = Date.now()
  const captureTime = capturedAt instanceof Date ? capturedAt.getTime() : new Date(capturedAt).getTime()
  const hoursSinceCapture = (now - captureTime) / (1000 * 60 * 60)
  // Decay over 24 hours
  return Math.min(hoursSinceCapture / 24, 1)
}

const createChumperIcon = (capturedBy, isGhost = false, isDiscovered = false, decayLevel = 0, isBattleMode = false) => {
  // Determine the CSS filter based on capture state
  let filter = ''
  
  // Apply decay as desaturation (max 50% gray at full decay)
  const decaySaturation = 1 - (decayLevel * 0.5)
  const decayOpacity = 1 - (decayLevel * 0.3)
  
  if (isGhost) {
    // Ghost markers - very faint (only shown in solo mode)
    filter = 'grayscale(100%) opacity(0.3)'
  } else if (!capturedBy) {
    // Uncaptured - grayscale, 10% opacity in battle mode
    const uncapturedOpacity = isBattleMode ? 0.1 : 1
    filter = `grayscale(100%) opacity(${uncapturedOpacity})`
  } else if (capturedBy === 'red') {
    // Red team - shift hue (blue to red), apply decay
    filter = `hue-rotate(160deg) saturate(${1.5 * decaySaturation}) opacity(${decayOpacity})`
  } else {
    // Blue team - apply decay
    filter = `saturate(${decaySaturation}) opacity(${decayOpacity})`
  }
  
  return L.divIcon({
    html: `<div style="position:relative;"><img src="${CHUMPER_URL}" style="width: 32px; height: 32px; filter: ${filter};" /></div>`,
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
    <div className="absolute bottom-24 left-4 z-[1000] bg-purple-500 shadow-lg px-3 py-2 font-nohemi">
      <div className="text-[10px] font-mono text-white">
        <div>Z {zoom}</div>
        <div>{center[0]}</div>
        <div>{center[1]}</div>
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

// Fly to last capture (no highlight ring - was buggy)
function LastCaptureHandler() {
  const map = useMap()
  
  useEffect(() => {
    const stored = localStorage.getItem('streetart-ctf-lastCapture')
    if (stored) {
      localStorage.removeItem('streetart-ctf-lastCapture')
      // Just clear it, don't show highlight (was showing in wrong locations)
    }
  }, [map])
  
  return null
}

// Location button component - White mode
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
      className="absolute bottom-24 right-4 z-[1000] w-12 h-12 bg-[#FAFAFA] shadow-lg flex items-center justify-center"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={locating ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: locating ? Infinity : 0 }}
      >
        <Crosshair size={20} className="text-black" />
      </motion.div>
    </motion.button>
  )
}

// Point detail panel - White mode
function PointPanel({ point, onClose, isDiscovered, isSoloView }) {
  const teamColor = point.capturedBy ? (TEAM_CONFIG[point.capturedBy]?.color || '#888') : null
  const pts = getPointValue(point)
  const isGhost = point.status === 'ghost'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-20 left-4 right-4 z-[1000] font-nohemi"
    >
      <div className="bg-[#FAFAFA] p-5 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-black/30 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="pr-8">
          {/* Status tag */}
          <div className="flex items-center gap-2 mb-2">
            {isGhost && (
              <span className="text-[10px] tracking-widest text-black/30">GHOST</span>
            )}
            {isSoloView ? (
              isDiscovered ? (
                <span className="text-[10px] tracking-widest text-purple-600">DISCOVERED</span>
              ) : (
                <span className="text-[10px] tracking-widest text-black/30">UNDISCOVERED</span>
              )
            ) : (
              point.capturedBy ? (
                <span className="text-[10px] tracking-widest" style={{ color: teamColor }}>
                  TEAM {point.capturedBy.toUpperCase()}
                </span>
              ) : (
                <span className="text-[10px] tracking-widest text-black/30">UNCLAIMED</span>
              )
            )}
          </div>
          
          {/* Name */}
          <h3 className="text-2xl font-bold text-black tracking-tight mb-1">{point.name}</h3>
          <p className="text-black/40 mb-4">{point.area}</p>
          
          {/* Stats row */}
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-black text-black">{pts}</div>
              <div className="text-xs text-black/40">points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-black capitalize">{point.size}</div>
              <div className="text-xs text-black/40">size</div>
            </div>
            {point.mhd && (
              <div>
                <div className="text-lg font-bold" style={{ color: point.mhd === 'metroB' ? '#eab308' : '#E53935' }}>
                  {point.mhd === 'metroB' ? 'Metro B' : 'Tram 12'}
                </div>
                <div className="text-xs text-black/40">nearby</div>
              </div>
            )}
          </div>
          
          {/* Captured by */}
          {!isSoloView && point.capturedByPlayer && (
            <div className="mt-4 pt-4 border-t border-black/10">
              <span className="text-xs text-black/40">Captured by </span>
              <span className="text-sm font-bold text-black">{point.capturedByPlayer}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Team cycle for dev mode (null = unclaimed, then cycle through teams)
const TEAM_CYCLE = [null, ...TEAMS]

// Territory modes - simplified
const TERRITORY_MODES = ['off', 'circles', 'squares', 'hexagons']

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
      shapes.push({ team, coords, pointId: point.id, capturedAt: point.capturedAt })
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
        pointId: point.id,
        capturedAt: point.capturedAt
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
      shapes.push({ team, coords, pointId: point.id, capturedAt: point.capturedAt })
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
  
  // Map settings (simplified)
  const [showLines, setShowLines] = useState(false)
  const [territoryMode, setTerritoryMode] = useState('circles')
  
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
  
  // Current hood discovery stats
  const hoodDiscoveryStats = useMemo(() => {
    const hoodArt = ART_POINTS.filter(art => {
      // Map hood names to area names
      const areaMap = { 'palmovka': 'Palmovka', 'vysocany': 'Vysocany', 'podebrady': 'Podebrady' }
      return art.area === areaMap[currentHood.id] || art.area === currentHood.name
    })
    const discovered = hoodArt.filter(art => discoveries[art.id])
    return { found: discovered.length, total: hoodArt.length }
  }, [discoveries, currentHood])
  
  const isSoloView = viewMode === 'solo'
  
  return (
    <div className="relative w-full h-full">
      {/* Top bar - White mode with safe area */}
      <div className="absolute top-0 left-0 right-0 pt-safe px-3 pb-2 z-[1000] flex items-center gap-2 font-nohemi" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
        {/* View mode toggle */}
        <div className="flex bg-[#FAFAFA] shadow-lg">
          <button
            onClick={() => setViewMode('solo')}
            className={`px-3 py-2 text-xs font-bold tracking-wide transition-all ${
              isSoloView 
                ? 'bg-black text-white'
                : 'text-black/40'
            }`}
          >
            SOLO
          </button>
          <button
            onClick={() => setViewMode('multi')}
            className={`px-3 py-2 text-xs font-bold tracking-wide transition-all ${
              !isSoloView 
                ? 'bg-black text-white'
                : 'text-black/40'
            }`}
          >
            BATTLE
          </button>
        </div>

        {/* Hood Selector */}
        <div className="flex bg-[#FAFAFA] shadow-lg">
          {Object.values(HOODS).map(hood => (
            <button
              key={hood.id}
              onClick={() => setCurrentHood(hood)}
              className={`px-3 py-2 text-xs font-bold transition-all ${
                currentHood.id === hood.id
                  ? 'text-black'
                  : 'text-black/30'
              }`}
            >
              {hood.name.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Stats pill */}
        <div className="ml-auto flex items-center gap-3 bg-[#FAFAFA] shadow-lg px-4 py-2">
          {isSoloView ? (
            <>
              <span className="text-xs font-bold" style={{ color: TEAM_CONFIG[player.team]?.color }}>
                {hoodDiscoveryStats.found}
              </span>
              <span className="text-xs text-black/30">/ {hoodDiscoveryStats.total}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-black" style={{ color: TEAM_CONFIG.red.color }}>{teamScores.red || 0}</span>
              <span className="text-xs text-black/20">vs</span>
              <span className="text-sm font-black" style={{ color: TEAM_CONFIG.blue.color }}>{teamScores.blue || 0}</span>
            </>
          )}
        </div>
      </div>

      {/* Dev Mode (bottom right, hidden by default) */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
        <motion.button
          onClick={() => setDevMode(!devMode)}
          className={`w-10 h-10 shadow-lg flex items-center justify-center transition-colors ${
            devMode 
              ? 'bg-purple-500 text-white' 
              : 'bg-[#FAFAFA] text-black/30'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Code size={16} />
        </motion.button>
        
        {devMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="w-10 h-10 bg-[#FAFAFA] shadow-lg flex items-center justify-center text-black/30"
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={16} />
          </motion.button>
        )}
      </div>

      {/* Dev Mode Banner */}
      <AnimatePresence>
        {devMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-purple-500 shadow-lg font-nohemi"
          >
            <span className="text-xs text-white font-bold tracking-widest">
              DEV MODE
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
        style={{ background: '#FAFAFA' }}
      >
        <TileLayer
          url={MAP_STYLE.tileUrl}
          attribution={MAP_STYLE.attribution}
        />
        
        <LocationButton />
        <ZoomDisplay devMode={devMode} />
        <FlyToHood hood={currentHood} />
        <LastCaptureHandler />
        
        {/* Metro B line */}
        <Polyline
          positions={METRO_B.map(s => s.location)}
          pathOptions={{
            color: '#eab308',
            weight: 4,
            opacity: 0.6
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
              fillColor: '#FAFAFA',
              fillOpacity: 1,
              weight: 2
            }}
          />
        ))}
        
        {/* Territory shapes - only in multi view, with decay */}
        {!isSoloView && territoryShapes.map((shape, idx) => {
          const decayLevel = shape.capturedAt ? calculateDecay(shape.capturedAt) : 0
          // Territory fades as it decays
          const fillOpacity = 0.15 * (1 - decayLevel * 0.7)
          const strokeOpacity = 0.4 * (1 - decayLevel * 0.5)
          
          return (
            <Polygon
              key={`territory-${shape.pointId}`}
              positions={shape.coords}
              pathOptions={{
                color: getTeamColor(shape.team),
                fillColor: getTeamColor(shape.team),
                fillOpacity,
                weight: 1,
                opacity: strokeOpacity
              }}
            />
          )
        })}
        
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
        {displayPoints
          // In battle mode, hide ghost markers completely
          .filter(point => isSoloView || point.status !== 'ghost')
          .map(point => {
          const isGhost = point.status === 'ghost'
          const isDiscovered = discoveries[point.id]
          // In solo view: show YOUR team color for discovered, gray for not found
          // In multi view: show capturing team's color with decay
          const markerTeam = isSoloView 
            ? (isDiscovered ? player.team : null)
            : point.capturedBy
          // Calculate decay only for multi view captured points
          const decayLevel = (!isSoloView && point.capturedBy && point.capturedAt) 
            ? calculateDecay(point.capturedAt) 
            : 0
          const icon = createChumperIcon(markerTeam, isGhost, false, decayLevel, !isSoloView)
          
          return (
            <Marker
              key={`${point.id}-${markerTeam || 'none'}-${Math.floor(decayLevel * 10)}`}
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
