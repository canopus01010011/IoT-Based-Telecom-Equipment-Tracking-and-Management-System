import type { RouteWaypoint } from "@/app/services/gps.service";

type LatLng = { latitude: number; longitude: number };

function distSq(a: LatLng, b: LatLng): number {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return dLat * dLat + dLng * dLng;
}

/** Find closest point on a route polyline and return from there to the end. */
export function sliceRouteFromPosition(
  route: RouteWaypoint[],
  position: LatLng,
): RouteWaypoint[] {
  if (route.length === 0) return [];

  let closestIdx = 0;
  let minDist = Infinity;

  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    if (!point) continue;
    const d = distSq(point, position);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  return route.slice(closestIdx);
}

export function resolveRouteName(site: Record<string, unknown> | null): string | null {
  if (!site) return null;
  const route = site.route;
  if (typeof route === "string" && route.trim()) return route.trim();
  const name = site.name;
  if (typeof name === "string" && name.startsWith("OS-")) return name.trim();
  return null;
}
