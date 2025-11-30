import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, useMap, useMapEvents, Tooltip } from 'react-leaflet'
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
import { X, MapPin, Crosshair, Sparkles, Code, RotateCcw, Ghost, Train, Circle } from 'lucide-react'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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
function PointPanel({ point, onClose }) {
  const color = point.capturedBy ? getTeamColor(point.capturedBy) : '#495057'
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
        style={{ borderColor: `${color}40` }}
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
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          >
            {isGhost ? (
              <Ghost size={20} className="text-white/30" />
            ) : point.capturedBy ? (
              <Sparkles size={20} style={{ color }} />
            ) : (
              <MapPin size={20} style={{ color }} />
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
            
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-bold" style={{ color }}>{pts} pts</span>
              {point.capturedBy ? (
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  Captured by {point.capturedBy}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                  {isGhost ? 'Gone' : 'Unclaimed'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Team cycle for dev mode (null = unclaimed, then cycle through teams)
const TEAM_CYCLE = [null, ...TEAMS]

// Main Prague Map component
export default function PragueMap() {
  const { player, artPoints, captureArt } = useGame()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [devMode, setDevMode] = useState(false)
  const [localArtPoints, setLocalArtPoints] = useState(artPoints)
  const [currentHood, setCurrentHood] = useState(HOODS.vysocany)
  
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
  
  // Calculate scores
  const teamScores = useMemo(() => {
    return calculateTeamScores(displayPoints)
  }, [displayPoints])
  
  const totalScore = Object.values(teamScores).reduce((a, b) => a + b, 0) || 1
  
  return (
    <div className="relative w-full h-full">
      {/* Team score bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-black/40 backdrop-blur-sm">
        {Object.entries(teamScores).map(([team, score]) => {
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
        })}
      </div>

      {/* Legend */}
      <div className="absolute top-10 left-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Teams</p>
        <div className="space-y-1.5">
          {TEAMS.map(team => (
            <div key={team} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getTeamColor(team) }}
              />
              <span className="text-xs text-white/70 capitalize font-medium">{team}</span>
              <span className="text-xs text-white/40 ml-auto">{teamScores[team] || 0} pts</span>
            </div>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Points</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-white/40" />
            <span className="text-xs text-white/40">Active</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-white/20" />
            <span className="text-xs text-white/30">Ghost</span>
          </div>
        </div>
        
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

      {/* Dev Mode Controls */}
      <div className="absolute top-10 right-4 z-[1000] flex flex-col gap-2">
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
        
        {/* Team connection lines - connects nearby captured points */}
        {Object.entries(teamLines).map(([team, lines]) => 
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
          const color = point.capturedBy ? getTeamColor(point.capturedBy) : '#ffffff'
          const isCaptured = !!point.capturedBy
          const isGhost = point.status === 'ghost'
          
          return (
            <CircleMarker
              key={point.id}
              center={point.location}
              radius={8}
              pathOptions={{
                color: devMode ? '#a855f7' : isGhost ? '#6b7280' : color,
                fillColor: isCaptured ? color : isGhost ? '#374151' : '#0a0a0f',
                fillOpacity: isGhost ? 0.4 : (isCaptured ? 0.8 : 1),
                weight: devMode ? 3 : 2,
                opacity: isGhost ? 0.5 : 1,
                dashArray: isGhost ? '3, 3' : undefined
              }}
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
          />
        )}
      </AnimatePresence>
    </div>
  )
}
