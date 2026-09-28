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
      cache: "force-cache",
    });

    if (!response.ok) {
      geoLookupCache.set(cacheKey, null);
      return null;
    }

    const result = await response.json();
    const address = result?.address || {};
    const placeName = address.road || address.neighbourhood || address.suburb || address.city_district || result?.display_name || null;
    geoLookupCache.set(cacheKey, placeName);
    return placeName;
  } catch {
    geoLookupCache.set(cacheKey, null);
    return null;
  }
}
