export const TIER_2_CITIES = [
    { name: 'Sivakasi', lat: 9.4533, lng: 77.8024, radiusKm: 15 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198, radiusKm: 25 },
    { name: 'Virudhunagar', lat: 9.5872, lng: 77.9515, radiusKm: 15 }
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}

export function checkServiceability(userLat: number, userLng: number): { isServiceable: boolean, city?: string, distance?: number } {
    for (const city of TIER_2_CITIES) {
        const distance = calculateDistance(userLat, userLng, city.lat, city.lng);
        if (distance <= city.radiusKm) {
            return { isServiceable: true, city: city.name, distance };
        }
    }
    return { isServiceable: false };
}
