// Top 10 University/Public Hospitals in Algiers used across the app.
// Kept in sync with the header dropdown and the internal case form.
export type ChuCoord = { lat: number; lng: number };

export type ChuEntry = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export const CHU_DATA: ChuEntry[] = [
  { id: "mustapha", name: "CHU Mustapha Pacha", lat: 36.7618, lng: 3.0538 },
  { id: "bab_el_oued", name: "CHU Bab El Oued (Mohamed Lamine Debaghine)", lat: 36.7885, lng: 3.0452 },
  { id: "beni_messous", name: "CHU Beni Messous (Issad Hassani)", lat: 36.7622, lng: 2.9839 },
  { id: "douera", name: "CHU Douera", lat: 36.6714, lng: 2.9465 },
  { id: "kouba", name: "CHU Kouba (Bachir Mentouri)", lat: 36.7265, lng: 3.0822 },
  { id: "hussein_dey", name: "CHU Hussein Dey (Parnet)", lat: 36.7412, lng: 3.0935 },
  { id: "birtraria", name: "CHU El Biar (Birtraria)", lat: 36.7725, lng: 3.0238 },
  { id: "zmirli", name: "EPH Saliha Ouatiki (Zmirli - El Harrach)", lat: 36.7118, lng: 3.1364 },
  { id: "bologhine", name: "EPH Bologhine (Ibn Ziri)", lat: 36.8042, lng: 3.0415 },
  { id: "rouiba", name: "EPH Rouïba", lat: 36.7358, lng: 3.2842 },
];

export const CHU_COORDS: Record<string, ChuCoord> = Object.fromEntries(
  CHU_DATA.map((c) => [c.name, { lat: c.lat, lng: c.lng }]),
);

export function googleMapsUrlFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function googleMapsUrl(hospital: string): string {
  const c = CHU_COORDS[hospital];
  if (c) return googleMapsUrlFromCoords(c.lat, c.lng);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital)}`;
}

// Opens Google Maps in a real new tab. Using window.open avoids the
// ERR_BLOCKED_BY_RESPONSE that <a target="_blank"> hits inside sandboxed
// preview iframes (Google sets X-Frame-Options: DENY on maps URLs).
export function openGoogleMaps(hospitalOrUrl: string, lat?: number, lng?: number): void {
  const url =
    typeof lat === "number" && typeof lng === "number"
      ? googleMapsUrlFromCoords(lat, lng)
      : googleMapsUrl(hospitalOrUrl);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
