import { Request, Response } from 'express';
import { Restaurant, Order } from '../db';
import { calculateDistance, checkServiceability, TIER_2_CITIES } from '../utils/geofencing';
import { AuthRequest } from '../middleware/auth';
import { getAIRecommendations } from '../utils/ai';

export const claimRestaurant = async (req: AuthRequest, res: Response) => {
    try {
        const restaurantId = req.params.id;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ status: 'error', message: 'Restaurant not found' });

        restaurant.ownerId = userId as any;
        await restaurant.save();

        res.json({ status: 'success', message: 'Restaurant claimed successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Claim failed' });
    }
};

export const getPublicRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find({}, 'name city _id image');
        res.json({ status: 'success', data: restaurants });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch restaurants' });
    }
};

const DEFAULT_LAT = 9.4533;
const DEFAULT_LNG = 77.8024;

type EnrichedRestaurant = Record<string, any>;

function demandMultiplier(level?: string) {
    if (level === 'high') return 1.35;
    if (level === 'low') return 0.9;
    return 1;
}

// Real-time Traffic Tracking State
const CITY_TRAFFIC_SENSORS: Record<string, { totalSpeed: number; count: number; lastUpdate: number }> = {};
const DRIVER_PREV_LOCS: Record<string, { lat: number; lng: number; time: number }> = {};

export const updateTrafficScore = (cityName: string, driverId: string, lat: number, lng: number) => {
    const prev = DRIVER_PREV_LOCS[driverId];
    const now = Date.now();
    
    if (prev && (now - prev.time) < 60000) { // Only calculate if update is within 1 minute
        const dist = calculateDistance(prev.lat, prev.lng, lat, lng);
        const timeHours = (now - prev.time) / 3600000;
        const speed = dist / timeHours; // km/h

        if (!CITY_TRAFFIC_SENSORS[cityName]) {
            CITY_TRAFFIC_SENSORS[cityName] = { totalSpeed: 0, count: 0, lastUpdate: now };
        }
        
        const sensor = CITY_TRAFFIC_SENSORS[cityName];
        sensor.totalSpeed = (sensor.totalSpeed * 0.8) + (speed * 0.2); // Smooth moving average
        sensor.count = Math.min(sensor.count + 1, 10);
        sensor.lastUpdate = now;
    }
    
    DRIVER_PREV_LOCS[driverId] = { lat, lng, time: now };
};

function enrichRestaurant(restaurant: any, userLat: number, userLng: number): EnrichedRestaurant {
    const distanceKm = restaurant.lat && restaurant.lng
        ? Number(calculateDistance(userLat, userLng, restaurant.lat, restaurant.lng).toFixed(1))
        : 0;

    const radiusKm = restaurant.serviceRadiusKm || 8;
    const inSmartRadius = distanceKm <= radiusKm;
    const dynamicFee = Math.max(10, Math.round((15 + distanceKm * 3) * demandMultiplier(restaurant.demandLevel)));
    const eta = Math.max(15, Math.round((restaurant.avgDeliveryMins || 28) + distanceKm * 1.5 + (restaurant.demandLevel === 'high' ? 4 : 0)));

    return {
        ...restaurant.toObject(),
        distanceKm,
        inSmartRadius,
        dynamicDeliveryFee: dynamicFee,
        smartEtaMins: eta,
        fastDeliveryBadge: eta <= 20,
        localDishCount: (restaurant.menu || []).filter((item: any) => item.isLocalSpecial).length
    };
}

export const getNearbyRestaurants = async (req: Request, res: Response) => {
    try {
        const lat = Number(req.query.lat || DEFAULT_LAT);
        const lng = Number(req.query.lng || DEFAULT_LNG);
        const radiusKm = Number(req.query.radiusKm || 10);
        const city = String(req.query.city || '').trim().toLowerCase();
        const search = String(req.query.search || '').trim().toLowerCase();
        const homeChefOnly = req.query.homeChef === 'true';
        const includeAll = req.query.includeAll === 'true';

        const restaurants = await Restaurant.find(includeAll ? {} : { isApproved: true });
        const enriched = restaurants.map((restaurant) => enrichRestaurant(restaurant, lat, lng));

        const filtered = enriched
            .filter((restaurant) => !homeChefOnly || restaurant.isHomeChef)
            .filter((restaurant) => {
                if (!search) return true;
                const haystack = [
                    restaurant.name,
                    restaurant.city,
                    ...(restaurant.cuisine || []),
                    ...(restaurant.localSpecialties || []),
                    ...((restaurant.menu || []).map((item: any) => item.name))
                ].join(' ').toLowerCase();
                return haystack.includes(search);
            })
            .sort((a, b) => {
                if (includeAll && a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1;
                if (a.fastDeliveryBadge !== b.fastDeliveryBadge) return a.fastDeliveryBadge ? -1 : 1;
                if (a.inSmartRadius !== b.inSmartRadius) return a.inSmartRadius ? -1 : 1;
                return a.distanceKm - b.distanceKm;
            });

        const serviceability = checkServiceability(lat, lng);

        res.json({
            status: 'success',
            data: filtered,
            meta: { smartRadiusKm: radiusKm, serviceability, total: filtered.length }
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching restaurants' });
    }
};

export const getRestaurantDetails = async (req: Request, res: Response) => {
    try {
        const lat = Number(req.query.lat || DEFAULT_LAT);
        const lng = Number(req.query.lng || DEFAULT_LNG);
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ status: 'error', message: 'Restaurant not found' });
        }

        const enriched = enrichRestaurant(restaurant, lat, lng);
        const smartSuggestions = (restaurant.menu || [])
            .filter((item: any) => item.recommendedAddons?.length)
            .slice(0, 4)
            .map((item: any) => ({ dish: item.name, addons: item.recommendedAddons }));

        res.json({ status: 'success', data: { ...enriched, smartSuggestions } });
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching details' });
    }
};

export const getVendorRestaurants = async (req: AuthRequest, res: Response) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const restaurants = await Restaurant.find({ ownerId: vendorId });
        res.json({ status: 'success', data: restaurants });
    } catch (error) {
        console.error('Vendor restaurants fetch error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch your restaurants' });
    }
};

export const updateRestaurantMenu = async (req: AuthRequest, res: Response) => {
    try {
        const restaurantId = req.params.id;
        const vendorId = req.user?.id;

        if (!vendorId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ status: 'error', message: 'Restaurant not found' });

        if (String(restaurant.ownerId) !== String(vendorId)) {
            return res.status(403).json({ status: 'error', message: 'You do not own this restaurant' });
        }

        const { menu } = req.body;
        if (!Array.isArray(menu)) return res.status(400).json({ status: 'error', message: 'menu must be an array' });

        restaurant.menu = menu.map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            veg: Boolean(item.veg ?? true),
            isAvailable: Boolean(item.isAvailable ?? true),
        })) as any;

        await restaurant.save();
        res.json({ status: 'success', message: 'Menu updated successfully', data: restaurant });
    } catch (error) {
        console.error('Menu update error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update menu' });
    }
};

export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const city = String(req.query.city || 'Sivakasi');
        const hour = Number(req.query.hour || new Date().getHours());

        // Real AI Weather Fetch
        let weather = 'clear';
        let temp = 25;
        try {
            const weatherRes = await fetch(`https://wttr.in/${city}?format=j1`);
            const weatherData: any = await weatherRes.json();
            weather = weatherData.current_condition[0].weatherDesc[0].value.toLowerCase();
            temp = Number(weatherData.current_condition[0].temp_C);
        } catch (e) {
            console.warn('Weather fetch failed, using fallback');
        }

        const restaurants = await Restaurant.find({ isApproved: true, city });
        const timeBucket = hour < 11 ? 'breakfast' : hour < 16 ? 'lunch' : hour < 19 ? 'snacks' : 'dinner';

        // Enhanced Logic for Recommendation
        const weatherKeyword = (weather.includes('rain') || weather.includes('drizzle')) ? 'hot' :
            (temp > 30) ? 'juice' :
                (temp < 20) ? 'soups' : 'special';

        const picks = restaurants
            .flatMap((restaurant: any) => (restaurant.menu || []).map((item: any) => {
                let score = 0;
                if (item.isLocalSpecial) score += 3;
                if (item.name?.toLowerCase().includes(weatherKeyword)) score += 5;
                if (item.category === timeBucket) score += 2;
                if (item.veg) score += 1;

                return {
                    restaurantId: restaurant._id,
                    restaurantName: restaurant.name,
                    city: restaurant.city,
                    itemName: item.name,
                    price: item.price,
                    image: item.image || restaurant.image,
                    reason: item.name?.toLowerCase().includes(weatherKeyword)
                        ? `Weather-synced: ${weather} & ${temp}°C`
                        : item.isLocalSpecial ? `Local ${timeBucket} hit` : `Top ${timeBucket} pick`,
                    score
                };
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        const heading = (weather.includes('rain'))
            ? `It's raining in ${city}! Grab something hot.`
            : temp > 30 ? `Beating the ${temp}°C heat with cool picks.`
                : `AI Recommended ${timeBucket} for you.`;
        // --- AI Integration Start ---
        const allDishes = restaurants.flatMap((r: any) => (r.menu || []).map((item: any) => ({
            restaurantId: r._id,
            restaurantName: r.name,
            itemName: item.name,
            price: item.price,
            category: item.category,
            isLocalSpecial: item.isLocalSpecial,
            image: item.image || r.image
        })));

        const aiResult = await getAIRecommendations(
            { city, condition: weather, temp, timeBucket },
            allDishes
        );

        if (aiResult && aiResult.recommendations) {
            const enrichedPicks = aiResult.recommendations.map((rec: any) => {
                const original = allDishes.find(d => d.itemName === rec.itemName && d.restaurantName === rec.restaurantName);
                if (!original) return null;
                return {
                    ...original,
                    reason: rec.reason,
                    aiPowered: true
                };
            }).filter(Boolean);

            if (enrichedPicks.length > 0) {
                return res.json({
                    status: 'success',
                    data: {
                        heading: aiResult.heading || heading,
                        timeBucket,
                        weather: `${weather} (${temp}°C)`,
                        picks: enrichedPicks,
                        aiPowered: true
                    }
                });
            }
        }
        // --- AI Integration End (Fallback below) ---

        res.json({ status: 'success', data: { heading, timeBucket, weather: `${weather} (${temp}°C)`, picks } });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ status: 'error', message: 'Unable to generate recommendations' });
    }
};

export const getHeatmapData = async () => {
    const restaurants = await Restaurant.find({ isApproved: true });
    const activeOrders = await Order.find({ status: { $in: ['pending', 'preparing', 'picked_up', 'on_the_way'] } });
    
    return TIER_2_CITIES.map((city) => {
        const localRestaurants = restaurants.filter((r: any) => r.city === city.name);
        const cityOrders = activeOrders.filter((o: any) => o.deliveryZone === city.name).length;
        
        // Traffic Signal (Average Driver Speed)
        const sensor = CITY_TRAFFIC_SENSORS[city.name];
        const avgSpeed = sensor && (Date.now() - sensor.lastUpdate < 300000) ? sensor.totalSpeed : 35; // Default 35km/h
        const trafficFactor = avgSpeed < 15 ? 0.3 : avgSpeed < 25 ? 0.15 : 0;

        // Base demand from static scores + Order Intensity + Traffic Congestion
        const baseDemand = localRestaurants.length
            ? localRestaurants.reduce((sum: number, r: any) => sum + (r.demandScore || 0.5), 0) / localRestaurants.length
            : 0.4;
        
        const intensity = Math.min(1, baseDemand + (cityOrders * 0.08) + trafficFactor);

        return {
            name:      city.name,
            lat:       city.lat,
            lng:       city.lng,
            zoneType:  intensity > 0.75 ? 'busy' : intensity > 0.5 ? 'steady' : 'fast',
            intensity: Number(intensity.toFixed(2)),
            etaLabel:  intensity > 0.75 ? 'Traffic & Busy' : intensity > 0.5 ? 'Steady Flow' : 'Fast Delivery',
            avgSpeed:  Math.round(avgSpeed),
            activeOrders: cityOrders
        };
    });
};

export const getHeatmap = async (_req: Request, res: Response) => {
    try {
        const citySummary = await getHeatmapData();
        res.json({ status: 'success', data: citySummary });
    } catch (error) {
        console.error('Heatmap error:', error);
        res.status(500).json({ status: 'error', message: 'Unable to fetch heatmap data' });
    }
};

export const registerRestaurant = async (req: AuthRequest, res: Response) => {
    try {
        const newRestaurant = new Restaurant({
            ...req.body,
            ownerId: req.user?.id,
            isApproved: false
        });
        await newRestaurant.save();
        res.status(201).json({ status: 'success', message: 'Registration submitted for approval' });
    } catch (error) {
        console.error('Restaurant registration failed:', error);
        res.status(500).json({ status: 'error', message: 'Registration failed' });
    }
};

export const approveRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json({ status: 'success', data: restaurant });
    } catch (error) {
        console.error('Restaurant approval failed:', error);
        res.status(500).json({ status: 'error', message: 'Approval failed' });
    }
};
