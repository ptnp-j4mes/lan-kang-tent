// Google Places API (New) — Place Details + Text Search.
// FieldMask is REQUIRED on every request. Server key kept in env only.
const KEY = process.env.GOOGLE_MAPS_SERVER_KEY ?? "";
const BASE = "https://places.googleapis.com/v1";

const DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "reviews",
  "nationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours",
].join(",");

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
].join(",");

function assertKey() {
  if (!KEY) throw new Error("GOOGLE_MAPS_SERVER_KEY not set");
}

export async function searchPlace(query: string) {
  assertKey();
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, languageCode: "th", regionCode: "TH" }),
  });
  if (!res.ok) throw new Error(`Places searchText ${res.status}`);
  const data = await res.json();
  return (data.places ?? []).map((p: any) => ({
    placeId: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    latitude: p.location?.latitude,
    longitude: p.location?.longitude,
  }));
}

export async function fetchPlaceDetails(placeId: string) {
  assertKey();
  const res = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": DETAIL_FIELD_MASK,
      "Accept-Language": "th",
    },
  });
  if (!res.ok) throw new Error(`Place Details ${res.status}`);
  const p = await res.json();
  return {
    placeId: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    latitude: p.location?.latitude,
    longitude: p.location?.longitude,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    nationalPhoneNumber: p.nationalPhoneNumber,
    websiteUri: p.websiteUri,
    openingHours: p.regularOpeningHours?.weekdayDescriptions,
    reviews: (p.reviews ?? []).map((r: any) => ({
      id: r.name?.split("/").pop() ?? r.name,
      authorName: r.authorAttribution?.displayName,
      authorPhotoUrl: r.authorAttribution?.photoUri,
      rating: r.rating,
      text: r.text?.text ?? r.originalText?.text,
      relativeTime: r.relativePublishTimeDescription,
      publishTime: r.publishTime,
    })),
  };
}
