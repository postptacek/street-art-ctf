// Street Art CTF Map Data
// Dynamic territory system - each captured point expands team territory

// Neighborhoods (hoods)
export const HOODS = {
  vysocany: {
    id: 'vysocany',
    name: 'Vysočany',
    center: [50.1090, 14.5050],
    zoom: 15,
    description: 'Prague industrial district'
  },
  palmovka: {
    id: 'palmovka',
    name: 'Palmovka',
    center: [50.1036, 14.4700],
    zoom: 15,
    description: 'Prague metro hub'
  },
  podebrady: {
    id: 'podebrady',
    name: 'Poděbrady',
    center: [50.1465, 15.1215],
    zoom: 16,
    description: 'Spa town east of Prague'
  }
}

// Default to first hood
export const DEFAULT_HOOD = 'vysocany'
export const MAP_CENTER = HOODS[DEFAULT_HOOD].center
export const DEFAULT_ZOOM = 15
export const MIN_ZOOM = 13
export const MAX_ZOOM = 18

// Map style for dark theme
export const MAP_STYLE = {
  tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap &copy; CARTO'
}

// Teams - only 2 for now
export const TEAMS = ['red', 'blue']

// Size categories: sticker (25), small (50), medium (100), large (200)
export const SIZES = {
  sticker: { points: 25, radius: 4 },
  small: { points: 50, radius: 5 },
  medium: { points: 100, radius: 6 },
  large: { points: 200, radius: 8 }
}

// Status: active (exists), ghost (removed/painted over)
export const STATUS = {
  active: 'active',
  ghost: 'ghost'
}

// Tram line 12 route (key stops) - from Sídliště Barrandov to Výstaviště Holešovice
// Only showing the Prague 8/9 section relevant to our map
export const TRAM_12 = [
  [50.1005, 14.4390], // Ortenovo náměstí
  [50.1020, 14.4480], // Libeňský most (south)
  [50.1035, 14.4560], // Palmovka tram
  [50.1050, 14.4650], // Balabenka
  [50.1090, 14.4750], // Libeňský zámeček
  [50.1120, 14.4830], // Stejskalova
  [50.1140, 14.4920], // Nádraží Vysočany
]

// Metro B stations in Prague 8/9 (correct coordinates from OpenStreetMap/Wikimapia)
export const METRO_B = [
  { name: 'Křižíkova', location: [50.0905, 14.4528] },
  { name: 'Invalidovna', location: [50.0942, 14.4665] },
  { name: 'Palmovka', location: [50.1036, 14.4744] },
  { name: 'Českomoravská', location: [50.1069, 14.4892] },
  { name: 'Vysočanská', location: [50.1097, 14.4989] },
  { name: 'Kolbenova', location: [50.1084, 14.5113] },
  { name: 'Hloubětín', location: [50.1064, 14.5194] },
  { name: 'Rajská zahrada', location: [50.1028, 14.5339] },
  { name: 'Černý Most', location: [50.1011, 14.5582] },
]

// Real street art points from actual photos with GPS data
// size: sticker | small | medium | large
// status: active | ghost
// mhd: nearby public transport (tram12, metroB, or null)
export const ART_POINTS = [
  // Vysočany / Hloubětín cluster (many photos here)
  { id: 'art-01', name: 'Kolbenova 1', location: [50.110192, 14.503811], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-02', name: 'Kolbenova 2', location: [50.110203, 14.503764], size: 'small', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-03', name: 'Kolbenova 3', location: [50.109847, 14.504250], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-04', name: 'Kolbenova 4', location: [50.109981, 14.504933], size: 'sticker', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-05', name: 'Kolbenova 5', location: [50.109764, 14.505742], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-06', name: 'Kolbenova 6', location: [50.109672, 14.505847], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-07', name: 'Hloubětín 1', location: [50.110383, 14.508192], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-08', name: 'Hloubětín 2', location: [50.110508, 14.509567], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-09', name: 'Vysočany 1', location: [50.110817, 14.505475], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-10', name: 'Vysočany 2', location: [50.110986, 14.504672], size: 'small', status: 'ghost', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-11', name: 'Vysočany 3', location: [50.110706, 14.504081], size: 'sticker', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-12', name: 'Vysočany 4', location: [50.110217, 14.503650], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-13', name: 'Vysočany 5', location: [50.109600, 14.505878], size: 'small', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-14', name: 'Vysočany 6', location: [50.109736, 14.508125], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-15', name: 'Vysočany 7', location: [50.109908, 14.508189], size: 'medium', status: 'ghost', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-16', name: 'Vysočany 8', location: [50.109517, 14.509489], size: 'sticker', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-17', name: 'Hloubětín 3', location: [50.110383, 14.509569], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-18', name: 'Hloubětín 4', location: [50.110369, 14.509569], size: 'small', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-19', name: 'Hloubětín 5', location: [50.110717, 14.509906], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-20', name: 'Harfa', location: [50.109428, 14.498994], size: 'medium', status: 'active', mhd: 'tram12', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-21', name: 'Harfa 2', location: [50.110039, 14.504783], size: 'small', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  
  // Karlín area (near Palmovka)
  { id: 'art-22', name: 'Karlín', location: [50.091603, 14.440019], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Karlín', hood: 'palmovka' },
  
  // Palmovka / Libeň area
  { id: 'art-23', name: 'Palmovka 1', location: [50.103611, 14.464650], size: 'medium', status: 'active', mhd: 'tram12', capturedBy: null, area: 'Palmovka', hood: 'palmovka' },
  { id: 'art-24', name: 'Libeň 1', location: [50.110244, 14.477544], size: 'small', status: 'active', mhd: 'tram12', capturedBy: null, area: 'Libeň', hood: 'palmovka' },
  { id: 'art-25', name: 'Palmovka 2', location: [50.103378, 14.472653], size: 'medium', status: 'ghost', mhd: 'metroB', capturedBy: null, area: 'Palmovka', hood: 'palmovka' },
  { id: 'art-26', name: 'Palmovka 3', location: [50.103625, 14.470758], size: 'sticker', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Palmovka', hood: 'palmovka' },
  { id: 'art-27', name: 'Palmovka 4', location: [50.103608, 14.470750], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Palmovka', hood: 'palmovka' },
  
  // Additional photos
  { id: 'art-28', name: 'Vysočany 9', location: [50.111042, 14.503097], size: 'large', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-29', name: 'Hloubětín 6', location: [50.108322, 14.507908], size: 'medium', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-30', name: 'Prosek', location: [50.112683, 14.499019], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Prosek', hood: 'vysocany' },
  { id: 'art-31', name: 'Hloubětín 7', location: [50.108422, 14.507728], size: 'small', status: 'active', mhd: 'metroB', capturedBy: null, area: 'Hloubětín', hood: 'vysocany' },
  { id: 'art-32', name: 'Vysočany 10', location: [50.109811, 14.504333], size: 'sticker', status: 'ghost', mhd: 'metroB', capturedBy: null, area: 'Vysočany', hood: 'vysocany' },
  { id: 'art-33', name: 'Palmovka 5', location: [50.103458, 14.463819], size: 'medium', status: 'active', mhd: 'tram12', capturedBy: null, area: 'Palmovka', hood: 'palmovka' },
  
  // Poděbrady - real photos from IMG_6003-6022
  { id: 'art-34', name: 'Poděbrady 1', location: [50.145850, 15.117822], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-35', name: 'Poděbrady 2', location: [50.147622, 15.118736], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-36', name: 'Poděbrady 3', location: [50.148750, 15.121333], size: 'large', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-37', name: 'Poděbrady 4', location: [50.148394, 15.123386], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-38', name: 'Poděbrady 5', location: [50.148381, 15.124169], size: 'small', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-39', name: 'Poděbrady 6', location: [50.148353, 15.124464], size: 'large', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-40', name: 'Poděbrady 7', location: [50.147914, 15.125636], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-41', name: 'Poděbrady 8', location: [50.148311, 15.125564], size: 'sticker', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-42', name: 'Poděbrady 9', location: [50.147572, 15.125086], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-43', name: 'Poděbrady 10', location: [50.145967, 15.124406], size: 'large', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-44', name: 'Poděbrady 11', location: [50.143106, 15.121906], size: 'medium', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
  { id: 'art-45', name: 'Poděbrady 12', location: [50.143394, 15.116619], size: 'small', status: 'active', mhd: null, capturedBy: null, area: 'Poděbrady', hood: 'podebrady' },
]

// Get points based on size
export function getPointValue(point) {
  return SIZES[point.size]?.points || 100
}

// Simple circle polygon around a point
function createCircle(lat, lng, radius = 0.001, segments = 16) {
  const points = []
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI
    points.push([
      lat + radius * Math.cos(angle),
      lng + radius * 1.6 * Math.sin(angle) // Adjust for lat/lng ratio
    ])
  }
  return points
}

// Convex hull algorithm (Graham scan)
function convexHull(points) {
  if (points.length < 3) return points
  
  // Find bottom-most point (or left-most if tie)
  let start = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] < points[start][0] || 
       (points[i][0] === points[start][0] && points[i][1] < points[start][1])) {
      start = i
    }
  }
  
  // Swap to first position
  [points[0], points[start]] = [points[start], points[0]]
  const pivot = points[0]
  
  // Sort by polar angle
  const sorted = points.slice(1).sort((a, b) => {
    const angleA = Math.atan2(a[1] - pivot[1], a[0] - pivot[0])
    const angleB = Math.atan2(b[1] - pivot[1], b[0] - pivot[0])
    return angleA - angleB
  })
  
  // Build hull
  const hull = [pivot]
  for (const p of sorted) {
    while (hull.length > 1) {
      const a = hull[hull.length - 2]
      const b = hull[hull.length - 1]
      const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
      if (cross <= 0) hull.pop()
      else break
    }
    hull.push(p)
  }
  
  return hull
}

// Expand a polygon outward by a buffer distance
function expandPolygon(polygon, buffer) {
  if (polygon.length < 3) return polygon
  
  // Find centroid
  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length
  const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length
  
  // Expand each point outward from centroid
  return polygon.map(p => {
    const dx = p[0] - cx
    const dy = p[1] - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return p
    const scale = (dist + buffer) / dist
    return [cx + dx * scale, cy + dy * scale]
  })
}

// Main function: generate all team territories
export function generateTeamTerritories(artPoints) {
  const territories = {}
  TEAMS.forEach(team => territories[team] = [])
  
  // Group captured points by team
  const teamPoints = {}
  TEAMS.forEach(team => teamPoints[team] = [])
  
  artPoints.forEach(point => {
    if (point.capturedBy && teamPoints[point.capturedBy]) {
      teamPoints[point.capturedBy].push(point)
    }
  })
  
  // Generate territories for each team
  TEAMS.forEach(team => {
    const points = teamPoints[team]
    if (points.length === 0) return
    
    if (points.length === 1) {
      // Single point: simple circle
      const p = points[0]
      territories[team].push({
        polygon: createCircle(p.location[0], p.location[1], 0.0015, 12),
        points: points
      })
    } else {
      // Multiple points: convex hull with buffer
      const coords = points.map(p => p.location)
      const hull = convexHull([...coords])
      const expanded = expandPolygon(hull, 0.001)
      
      territories[team].push({
        polygon: expanded,
        points: points
      })
    }
  })
  
  return territories
}

// Get team color
export function getTeamColor(team) {
  const colors = {
    red: '#ff6b6b',
    blue: '#4dabf7',
    green: '#51cf66',
    yellow: '#fcc419',
    neutral: '#495057'
  }
  return colors[team] || colors.neutral
}

// Calculate team scores from captured points (using size-based values)
export function calculateTeamScores(artPoints) {
  const scores = {}
  TEAMS.forEach(team => scores[team] = 0)
  
  artPoints.forEach(point => {
    if (point.capturedBy && scores[point.capturedBy] !== undefined) {
      // Use size-based point value, ignore ghost points (half value)
      const baseValue = getPointValue(point)
      const value = point.status === 'ghost' ? Math.floor(baseValue / 2) : baseValue
      scores[point.capturedBy] += value
    }
  })
  return scores
}
