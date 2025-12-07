#!/usr/bin/env node
/**
 * Chump AR Target Manager - CLI Tool
 * 
 * Usage:
 *   node target-manager.js status           - Show current database status
 *   node target-manager.js add <dir>        - Add images from directory
 *   node target-manager.js list             - List all targets
 *   node target-manager.js set <idx> <field> <value> - Set a field on a target
 *   node target-manager.js export           - Generate all export files
 *   node target-manager.js compile          - Compile .mind file (requires browser)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const TOOLS_DIR = __dirname;
const PROJECT_DIR = path.join(TOOLS_DIR, '..');
const DB_FILE = path.join(TOOLS_DIR, 'targets-db.json');
const EXPORT_DIR = path.join(TOOLS_DIR, 'exports');

// Ensure export dir exists
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR);

// Size points
const SIZES = { sticker: 25, small: 50, medium: 100, large: 200 };

// Load/save database
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
  return {
    version: 0,
    lastCompiled: null,
    targets: [],
    settings: { defaultHood: 'centrum', defaultSize: 'medium' }
  };
}

function saveDB(db) {
  db.version++;
  db.lastModified = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log(`💾 Database saved (v${db.version})`);
}

// Extract GPS from original photo using exiftool
function extractGPS(photoPath) {
  try {
    const output = execSync(`exiftool -GPSLatitude -GPSLongitude -n "${photoPath}"`, { encoding: 'utf8' });
    const latMatch = output.match(/GPS Latitude\s*:\s*([\d.]+)/);
    const lngMatch = output.match(/GPS Longitude\s*:\s*([\d.]+)/);
    if (latMatch && lngMatch) {
      return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
    }
  } catch (e) {}
  return null;
}

// Add images from directory
function addImages(db, dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    return;
  }
  
  const files = fs.readdirSync(dirPath)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .sort((a, b) => {
      // Try to sort by number in filename
      const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    });
  
  console.log(`📁 Found ${files.length} images in ${dirPath}`);
  
  let added = 0;
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    
    // Check if already exists
    const exists = db.targets.some(t => t.fileName === file || t.sourcePath === filePath);
    if (exists && !options.force) {
      console.log(`  ⏭️  ${file} (already exists)`);
      continue;
    }
    
    // Try to find original photo for GPS
    let gps = null;
    const origMatch = file.match(/IMG_(\d+)/i);
    if (origMatch && options.photosDir) {
      const origPath = path.join(options.photosDir, `IMG_${origMatch[1]}.HEIC`);
      if (fs.existsSync(origPath)) {
        gps = extractGPS(origPath);
      }
    }
    
    // Extract index from filename if present (e.g., "251207_IMG_6186_1.png" -> 1)
    const idxMatch = file.match(/_(\d+)\.png$/i);
    const suggestedIdx = idxMatch ? parseInt(idxMatch[1]) : null;
    
    const target = {
      fileName: file,
      sourcePath: filePath,
      artId: '',
      name: '',
      hood: options.hood || db.settings.defaultHood,
      area: '',
      size: options.size || db.settings.defaultSize,
      lat: gps?.lat || null,
      lng: gps?.lng || null,
      addedAt: new Date().toISOString(),
      sourceIndex: suggestedIdx
    };
    
    db.targets.push(target);
    added++;
    console.log(`  ✅ ${file}${gps ? ` (GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})` : ''}`);
  }
  
  console.log(`\n📊 Added ${added} new targets (total: ${db.targets.length})`);
}

// List targets
function listTargets(db) {
  console.log('\n📋 TARGETS DATABASE');
  console.log('═'.repeat(80));
  console.log(`Version: ${db.version} | Total: ${db.targets.length} | Last Modified: ${db.lastModified || 'never'}`);
  console.log('─'.repeat(80));
  
  if (db.targets.length === 0) {
    console.log('  (no targets)');
    return;
  }
  
  console.log('IDX  ART ID      NAME                 HOOD       SIZE     GPS');
  console.log('─'.repeat(80));
  
  db.targets.forEach((t, idx) => {
    const artId = (t.artId || '-').padEnd(10);
    const name = (t.name || t.fileName.slice(0, 18)).padEnd(20);
    const hood = (t.hood || '-').padEnd(10);
    const size = (t.size || '-').padEnd(8);
    const gps = t.lat && t.lng ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : '-';
    console.log(`${String(idx).padStart(3)}  ${artId} ${name} ${hood} ${size} ${gps}`);
  });
  
  console.log('─'.repeat(80));
  
  // Stats
  const mapped = db.targets.filter(t => t.artId).length;
  const withGPS = db.targets.filter(t => t.lat && t.lng).length;
  const hoods = [...new Set(db.targets.map(t => t.hood).filter(Boolean))];
  
  console.log(`\n📊 Stats: ${mapped}/${db.targets.length} mapped | ${withGPS} with GPS | Hoods: ${hoods.join(', ') || 'none'}`);
}

// Set field on target
function setField(db, idx, field, value) {
  if (idx < 0 || idx >= db.targets.length) {
    console.error(`❌ Invalid index: ${idx}`);
    return;
  }
  
  const target = db.targets[idx];
  const validFields = ['artId', 'name', 'hood', 'area', 'size', 'lat', 'lng'];
  
  if (!validFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}. Valid: ${validFields.join(', ')}`);
    return;
  }
  
  // Parse numeric fields
  if (field === 'lat' || field === 'lng') {
    value = parseFloat(value);
  }
  
  target[field] = value;
  console.log(`✅ Set target[${idx}].${field} = ${value}`);
}

// Auto-assign art IDs
function autoAssignIds(db, startFrom = 1) {
  const existingIds = db.targets
    .filter(t => t.artId)
    .map(t => parseInt(t.artId.replace('art-', '')) || 0);
  
  let nextId = Math.max(startFrom, ...existingIds) + 1;
  let assigned = 0;
  
  db.targets.forEach(t => {
    if (!t.artId) {
      t.artId = `art-${String(nextId).padStart(2, '0')}`;
      nextId++;
      assigned++;
    }
  });
  
  console.log(`✅ Auto-assigned ${assigned} art IDs (starting from art-${String(Math.max(startFrom, ...existingIds) + 1).padStart(2, '0')})`);
}

// Generate exports
function generateExports(db) {
  console.log('\n📦 GENERATING EXPORTS');
  console.log('═'.repeat(60));
  
  // 1. AR Scanner code
  const artEntries = db.targets.map((t, idx) => {
    const artId = t.artId || `art-${String(idx + 1).padStart(2, '0')}`;
    const pts = SIZES[t.size] || 100;
    const loc = t.lat && t.lng ? `[${t.lat},${t.lng}]` : '[0,0]';
    const name = t.name || artId;
    const area = t.area || t.hood || '';
    return `      '${artId}':{name:'${name}',area:'${area}',points:${pts},loc:${loc}}`;
  }).join(',\n');
  
  const mapEntries = db.targets.map((t, idx) => {
    const artId = t.artId || `art-${String(idx + 1).padStart(2, '0')}`;
    return `${idx}:'${artId}'`;
  }).join(',');
  
  const scannerCode = `    // Generated by Chump Target Manager v${db.version}
    // ${new Date().toISOString()}
    const ART = {
${artEntries}
    };
    const MAP = {${mapEntries}};
    const TARGET_COUNT = ${db.targets.length};`;
  
  fs.writeFileSync(path.join(EXPORT_DIR, 'ar-scanner-code.js'), scannerCode);
  console.log('  ✅ ar-scanner-code.js');
  
  // 2. pragueMap.js code
  const mapCode = db.targets
    .filter(t => t.artId)
    .map(t => {
      const loc = t.lat && t.lng ? `[${t.lat}, ${t.lng}]` : '[0, 0]';
      return `  { id: '${t.artId}', name: '${t.name || t.artId}', location: ${loc}, size: '${t.size || 'medium'}', status: 'active', mhd: null, capturedBy: null, area: '${t.area || ''}', hood: '${t.hood || ''}' },`;
    }).join('\n');
  
  fs.writeFileSync(path.join(EXPORT_DIR, 'pragueMap-code.js'), `// Add to ART_POINTS in pragueMap.js\n// Generated: ${new Date().toISOString()}\n\n${mapCode}`);
  console.log('  ✅ pragueMap-code.js');
  
  // 3. Build report
  const hoods = [...new Set(db.targets.map(t => t.hood).filter(Boolean))];
  const report = `# Chump Target Build Report

Generated: ${new Date().toISOString()}
Database Version: ${db.version}

## Summary
- **Total targets:** ${db.targets.length}
- **Mapped (with art ID):** ${db.targets.filter(t => t.artId).length}
- **With GPS:** ${db.targets.filter(t => t.lat && t.lng).length}
- **Hoods:** ${hoods.join(', ') || 'none'}

## Hood Breakdown
${hoods.map(h => `- **${h}:** ${db.targets.filter(t => t.hood === h).length} targets`).join('\n')}

## Target List
| Index | Art ID | Name | Hood | Size | GPS |
|-------|--------|------|------|------|-----|
${db.targets.map((t, idx) => `| ${idx} | ${t.artId || '-'} | ${t.name || '-'} | ${t.hood || '-'} | ${t.size || '-'} | ${t.lat && t.lng ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : '-'} |`).join('\n')}

## Files
- \`targets.mind\` - MindAR compiled targets
- \`ar-scanner-code.js\` - Code for ar-scanner.html
- \`pragueMap-code.js\` - Code for pragueMap.js
`;
  
  fs.writeFileSync(path.join(EXPORT_DIR, 'build-report.md'), report);
  console.log('  ✅ build-report.md');
  
  // 4. Image list for MindAR compiler
  const imageList = db.targets.map(t => t.sourcePath).join('\n');
  fs.writeFileSync(path.join(EXPORT_DIR, 'image-list.txt'), imageList);
  console.log('  ✅ image-list.txt');
  
  console.log(`\n📁 Exports saved to: ${EXPORT_DIR}`);
  console.log('\n⚠️  To compile .mind file, use the online compiler:');
  console.log('   https://hiukim.github.io/mind-ar-js-doc/tools/compile/');
  console.log('   Upload images in the order listed in image-list.txt');
}

// Move target (reorder)
function moveTarget(db, fromIdx, toIdx) {
  if (fromIdx < 0 || fromIdx >= db.targets.length || toIdx < 0 || toIdx >= db.targets.length) {
    console.error(`❌ Invalid index`);
    return;
  }
  const item = db.targets.splice(fromIdx, 1)[0];
  db.targets.splice(toIdx, 0, item);
  console.log(`✅ Moved target ${fromIdx} → ${toIdx}`);
}

// Delete target
function deleteTarget(db, idx) {
  if (idx < 0 || idx >= db.targets.length) {
    console.error(`❌ Invalid index: ${idx}`);
    return;
  }
  const removed = db.targets.splice(idx, 1)[0];
  console.log(`✅ Deleted target ${idx}: ${removed.fileName}`);
}

// Bulk set from GPS photos
function extractAllGPS(db, photosDir) {
  if (!fs.existsSync(photosDir)) {
    console.error(`❌ Directory not found: ${photosDir}`);
    return;
  }
  
  let updated = 0;
  db.targets.forEach((t, idx) => {
    if (t.lat && t.lng) return; // Skip if already has GPS
    
    // Try to find matching photo
    const origMatch = t.fileName.match(/IMG_(\d+)/i);
    if (origMatch) {
      const patterns = [
        `IMG_${origMatch[1]}.HEIC`,
        `IMG_${origMatch[1]}.heic`,
        `IMG_${origMatch[1]}.jpg`,
        `IMG_${origMatch[1]}.JPG`
      ];
      
      for (const pattern of patterns) {
        const origPath = path.join(photosDir, pattern);
        if (fs.existsSync(origPath)) {
          const gps = extractGPS(origPath);
          if (gps) {
            t.lat = gps.lat;
            t.lng = gps.lng;
            console.log(`  ✅ [${idx}] ${t.fileName} → GPS: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`);
            updated++;
          }
          break;
        }
      }
    }
  });
  
  console.log(`\n📍 Updated GPS for ${updated} targets`);
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

const db = loadDB();

switch (command) {
  case 'status':
  case 'list':
  case 'ls':
    listTargets(db);
    break;
    
  case 'add':
    const dir = args[1];
    if (!dir) {
      console.error('Usage: node target-manager.js add <directory> [--photos <photos-dir>] [--hood <hood>]');
      process.exit(1);
    }
    const photosDir = args.includes('--photos') ? args[args.indexOf('--photos') + 1] : null;
    const hood = args.includes('--hood') ? args[args.indexOf('--hood') + 1] : null;
    addImages(db, dir, { photosDir, hood });
    saveDB(db);
    break;
    
  case 'set':
    const setIdx = parseInt(args[1]);
    const field = args[2];
    const value = args.slice(3).join(' ');
    setField(db, setIdx, field, value);
    saveDB(db);
    break;
    
  case 'auto-id':
  case 'autoid':
    const startFrom = parseInt(args[1]) || 1;
    autoAssignIds(db, startFrom);
    saveDB(db);
    break;
    
  case 'move':
    moveTarget(db, parseInt(args[1]), parseInt(args[2]));
    saveDB(db);
    break;
    
  case 'delete':
  case 'rm':
    deleteTarget(db, parseInt(args[1]));
    saveDB(db);
    break;
    
  case 'gps':
    const gpsPhotosDir = args[1];
    if (!gpsPhotosDir) {
      console.error('Usage: node target-manager.js gps <photos-directory>');
      process.exit(1);
    }
    extractAllGPS(db, gpsPhotosDir);
    saveDB(db);
    break;
    
  case 'export':
    generateExports(db);
    break;
    
  case 'clear':
    if (args[1] === '--confirm') {
      db.targets = [];
      saveDB(db);
      console.log('✅ Database cleared');
    } else {
      console.log('⚠️  This will delete all targets. Run with --confirm to proceed.');
    }
    break;
    
  default:
    console.log(`
🎯 Chump AR Target Manager

Usage:
  node target-manager.js <command> [options]

Commands:
  list, ls, status      Show all targets
  add <dir>             Add images from directory
                        --photos <dir>  Directory with original photos (for GPS)
                        --hood <name>   Set hood for new targets
  set <idx> <field> <value>  Set a field on a target
                        Fields: artId, name, hood, area, size, lat, lng
  auto-id [start]       Auto-assign art IDs to unmapped targets
  move <from> <to>      Reorder a target
  delete, rm <idx>      Delete a target
  gps <photos-dir>      Extract GPS from original photos
  export                Generate all export files
  clear --confirm       Delete all targets

Examples:
  node target-manager.js add ./new-targets --hood centrum
  node target-manager.js set 0 artId art-46
  node target-manager.js set 0 name "Centrum 1"
  node target-manager.js gps "/path/to/original/photos"
  node target-manager.js auto-id 46
  node target-manager.js export
`);
}
