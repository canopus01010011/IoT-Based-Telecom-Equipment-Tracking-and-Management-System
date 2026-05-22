import MapViewDirections from "react-native-maps-directions";
import { HAS_GOOGLE_DIRECTIONS, GOOGLE_API_KEY } from "@/constants/config";

type LatLng = { latitude: number; longitude: number };

type Props = {
  origin: LatLng;
  destination: LatLng;
  strokeColor: string;
  strokeWidth?: number;
  onReady?: (distanceKm: number, durationMin: number) => void;
};

/** Road-following segment via Google Directions (driving). Renders nothing without API key. */
export default function RoadDirections({
  origin,
  destination,
  strokeColor,
  strokeWidth = 4,
  onReady,
}: Props) {
  if (!HAS_GOOGLE_DIRECTIONS) return null;

  return (
    <MapViewDirections
      origin={origin}
      destination={destination}
      apikey={GOOGLE_API_KEY}
      mode="DRIVING"
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      onReady={(result) => {
        onReady?.(result.distance, Math.ceil(result.duration));
      }}
      onError={(err) => {
        console.warn("Directions API:", err);
      }}
    />
  );
}
