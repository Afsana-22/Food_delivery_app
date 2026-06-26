import { Router } from 'express';
import { createOrder, getUserOrders, updateOrderStatus, getActiveOrders, getVendorOrders, getOrderById, sendOrderMessage } from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/active', getActiveOrders);
router.get('/vendor/:restaurantId', getVendorOrders);
router.get('/user/:userId', getUserOrders);
router.get('/:id', getOrderById);
router.post('/:id/messages', sendOrderMessage);
router.patch('/:id/status', updateOrderStatus);

export default router;
