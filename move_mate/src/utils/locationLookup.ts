const geoLookupCache = new Map<string, string | null>();

export default async function resolvePlaceNameFromGps(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const normalizedLatitude = Number(latitude.toFixed(5));
  const normalizedLongitude = Number(longitude.toFixed(5));
  const cacheKey = `${normalizedLatitude},${normalizedLongitude}`;

  if (geoLookupCache.has(cacheKey)) {
    return geoLookupCache.get(cacheKey) ?? null;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: { "User-Agent": "MoveMate/1.0 campus shuttle tracker" },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const address = result?.address || {};
    const placeName = [
      result?.name,
      address.amenity,
      address.building,
      address.leisure,
      address.tourism,
      address.university,
      address.college,
      address.school,
      address.road,
      address.neighbourhood,
      address.suburb,
      address.city_district,
    ].find((candidate) => typeof candidate === "string" && candidate.trim())?.split(",")[0].trim()
      || result?.display_name?.split(",")[0].trim()
      || null;
    if (placeName) geoLookupCache.set(cacheKey, placeName);
    return placeName;
  } catch {
    return null;
  }
}
