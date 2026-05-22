import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveRoutesDir(): string {
  if (process.env.IOT_ROUTES_DIR) {
    return process.env.IOT_ROUTES_DIR;
  }

  const candidates = [
    path.join(__dirname, '../../..', 'iot_system'),
    path.join(__dirname, '../../iot_system'),
    path.join(process.cwd(), 'iot_system'),
    path.join(process.cwd(), '..', 'iot_system'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  return candidates[0];
}

const ROUTES_DIR = resolveRoutesDir();

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
 * Load route waypoints: IoT Railway service first, then local GPX files.
 */
export async function getRouteWaypoints(routeName: string): Promise<RouteWaypoint[]> {
  const iotBase = process.env.IOT_SERVICE_URL?.replace(/\/$/, '');
  if (iotBase) {
    try {
      const url = `${iotBase}/routes/${encodeURIComponent(routeName)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const data = (await res.json()) as { waypoints?: RouteWaypoint[] };
        if (data.waypoints?.length) return data.waypoints;
      }
      console.warn(`IoT service returned ${res.status} for route ${routeName}`);
    } catch (error) {
      console.warn(`IoT service unreachable (${iotBase}), using local GPX:`, error);
    }
  }
  return parseGPXFileLocal(routeName);
}

/**
 * Parse GPX file from disk (local / monorepo deploy).
 */
export function parseGPXFileLocal(routeName: string): RouteWaypoint[] {
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
      const lat = match[1];
      const lon = match[2];
      if (!lat || !lon) continue;
      waypoints.push({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
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
/** @deprecated Use getRouteWaypoints — kept for callers expecting sync local parse */
export function parseGPXFile(routeName: string): RouteWaypoint[] {
  return parseGPXFileLocal(routeName);
}

export function getAvailableRoutes(): string[] {
  return Object.keys(ROUTE_MAPPING);
}
