// utils/geoFencing.ts

// Haversine Formula — 2 GPS points ke beech distance (meters mein)
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

export const isWithinGeoFence = (
    employeeLat: number,
    employeeLng: number,
    branchLat: number,
    branchLng: number,
    radius: number
): boolean => {
    const distance = calculateDistance(employeeLat, employeeLng, branchLat, branchLng);
    return distance <= radius;
};