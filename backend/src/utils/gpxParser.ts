import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.join(__dirname, '../../..', 'iot_system');

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
}

// Map route names to GPX files
const ROUTE_MAPPING: Record<string, string> = {
  'OS-APN': 'OS_APN.gpx',
  'OS-BabaHassen': 'OS_BabaHassen.gpx',
  'OS-Birtouta': 'OS_Birtouta.gpx',
  'OS-Bouzareah': 'OS_Bouzareah.gpx',
  'OS-Cheraga': 'OS_Cheraga.gpx',
  'OS-Draria': 'OS_Draria.gpx',
  'OS-HusseinDey': 'OS_HusseinDey.gpx',
  'OS-Meftah': 'OS_Meftah.gpx',
  'OS-Sablettes': 'OS_Sablettes.gpx',
  'OS-Souakria': 'OS_Souakria.gpx',
};

/**
 * Parse GPX file and extract waypoints
 */
export function parseGPXFile(routeName: string): RouteWaypoint[] {
  try {
    const gpxFileName = ROUTE_MAPPING[routeName];
    if (!gpxFileName) {
      console.warn(`Route not found: ${routeName}`);
      return [];
    }

    const gpxPath = path.join(ROUTES_DIR, gpxFileName);

    if (!fs.existsSync(gpxPath)) {
      console.warn(`GPX file not found: ${gpxPath}`);
      return [];
    }

    const gpxContent = fs.readFileSync(gpxPath, 'utf-8');
    const waypoints: RouteWaypoint[] = [];

    // Parse trkpt elements with regex
    const trkptRegex = /<trkpt lat="([\d.-]+)" lon="([\d.-]+)"/g;
    let match;

    while ((match = trkptRegex.exec(gpxContent)) !== null) {
      waypoints.push({
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      });
    }

    return waypoints;
  } catch (error) {
    console.error(`Error parsing GPX file for route ${routeName}:`, error);
    return [];
  }
}

/**
 * Get all available routes
 */
export function getAvailableRoutes(): string[] {
  return Object.keys(ROUTE_MAPPING);
}
