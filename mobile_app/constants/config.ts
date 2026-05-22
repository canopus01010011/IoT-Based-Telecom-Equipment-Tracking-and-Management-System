/** Google Directions API key (enable Directions API in Google Cloud). */
export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY?.trim() ||
  "";

export const HAS_GOOGLE_DIRECTIONS =
  GOOGLE_API_KEY.length > 0 && GOOGLE_API_KEY !== "YOUR_GOOGLE_API_KEY";
