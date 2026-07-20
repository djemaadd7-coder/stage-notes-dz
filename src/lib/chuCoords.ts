// Approximate lat/lng coordinates for Algerian CHUs used in the app.
// Frontend-only mapping — kept in sync with the HOSPITALS list.
export type ChuCoord = { lat: number; lng: number };

export const CHU_COORDS: Record<string, ChuCoord> = {
  "CHU Mustapha Pacha": { lat: 36.7538, lng: 3.0588 },
  "CHU Bab El Oued": { lat: 36.7925, lng: 3.0503 },
  "CHU Beni Messous": { lat: 36.7692, lng: 2.9903 },
  "CHU Douera": { lat: 36.6683, lng: 2.9414 },
  "CHU Blida": { lat: 36.4700, lng: 2.8277 },
  "CHU Oran": { lat: 35.7028, lng: -0.6414 },
  "CHU Constantine": { lat: 36.3650, lng: 6.6147 },
  "CHU Annaba": { lat: 36.9000, lng: 7.7667 },
  "CHU Sétif": { lat: 36.1898, lng: 5.4108 },
  "CHU Batna": { lat: 35.5559, lng: 6.1741 },
  "CHU Tizi Ouzou": { lat: 36.7169, lng: 4.0497 },
  "CHU Tlemcen": { lat: 34.8828, lng: -1.3169 },
  "CHU Sidi Bel Abbès": { lat: 35.1892, lng: -0.6306 },
  "CHU Béjaïa": { lat: 36.7525, lng: 5.0844 },
  "CHU Mostaganem": { lat: 35.9314, lng: 0.0894 },
  "CHU Biskra": { lat: 34.8500, lng: 5.7333 },
  "CHU Ouargla": { lat: 31.9539, lng: 5.3378 },
  "CHU Béchar": { lat: 31.6238, lng: -2.2166 },
};

export function googleMapsUrl(hospital: string): string {
  const c = CHU_COORDS[hospital];
  if (c) {
    return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital)}`;
}
