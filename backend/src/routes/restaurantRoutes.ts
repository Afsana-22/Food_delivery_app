import { Router } from 'express';
import {
    getNearbyRestaurants,
    getRestaurantDetails,
    approveRestaurant,
    registerRestaurant,
    getRecommendations,
    getHeatmap,
    getVendorRestaurants,
    getPublicRestaurants,
    claimRestaurant,
    updateRestaurantMenu
} from '../controllers/restaurantController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/public/selector', getPublicRestaurants);
router.get('/', getNearbyRestaurants);
router.get('/recommendations/ai', getRecommendations);
router.get('/heatmap/live', getHeatmap);
router.get('/managed', authenticate, getVendorRestaurants);
router.post('/', authenticate, registerRestaurant);
router.get('/:id', getRestaurantDetails);
router.patch('/:id/approve', approveRestaurant);
router.patch('/:id/claim', authenticate, claimRestaurant);
router.patch('/:id/menu', authenticate, updateRestaurantMenu);

export default router;
