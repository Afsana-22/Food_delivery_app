import { Request, Response } from 'express';
import { Order, Restaurant } from '../db';
import { io } from '../server';
import { calculateDistance } from '../utils/geofencing';
import { AuthRequest } from '../middleware/auth';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    Sivakasi: { lat: 9.4533, lng: 77.8024 },
    Virudhunagar: { lat: 9.5872, lng: 77.9515 },
    Madurai: { lat: 9.9252, lng: 78.1198 }
};

function getPricing(restaurant: any, deliveryLat?: number, deliveryLng?: number) {
    const baseFee = 25;
    const originLat = deliveryLat || CITY_COORDINATES[restaurant.city]?.lat || restaurant.lat || 9.4533;
    const originLng = deliveryLng || CITY_COORDINATES[restaurant.city]?.lng || restaurant.lng || 77.8024;
    const distanceKm = restaurant.lat && restaurant.lng
        ? calculateDistance(originLat, originLng, restaurant.lat, restaurant.lng)
        : 3;
    const demandMultiplier = restaurant.demandLevel === 'high' ? 1.35 : restaurant.demandLevel === 'low' ? 0.9 : 1;
    const deliveryFee = Math.max(20, Math.round((baseFee + distanceKm * 6) * demandMultiplier));
    const eta = Math.max(15, Math.round((restaurant.avgDeliveryMins || 28) + distanceKm * 1.5 + (restaurant.demandLevel === 'high' ? 4 : 0)));

    return {
        deliveryFee,
        dynamicPricingMultiplier: demandMultiplier,
        estimatedDeliveryMins: eta,
        distanceKm: Number(distanceKm.toFixed(1))
    };
}

export const createOrder = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            restaurantId,
            items,
            totalAmount,
            paymentMethod,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            ecoFriendly,
            discountAmount,
            couponCode,
            couponMeta,
            customInstructions,
            scheduledFor,
            subtotal
        } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ status: 'error', message: 'Restaurant not found' });
        }

        const pricing = getPricing(restaurant, deliveryLat, deliveryLng);
        const newOrder = new Order({
            userId,
            restaurantId,
            items,
            subtotal: subtotal || items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0),
            totalAmount: totalAmount || 0,
            paymentMethod,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            ecoFriendly: Boolean(ecoFriendly),
            discountAmount: discountAmount || 0,
            deliveryFee: pricing.deliveryFee,
            dynamicPricingMultiplier: pricing.dynamicPricingMultiplier,
            couponCode,
            couponMeta,
            customInstructions,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
            estimatedDeliveryMins: pricing.estimatedDeliveryMins,
            deliveryZone: restaurant.city,
            pricingBreakdown: pricing,
            status: scheduledFor ? 'accepted' : 'pending',
            chatMessages: [{ sender: 'system', text: scheduledFor ? 'Scheduled order confirmed.' : 'Order placed successfully.' }]
        });

        await newOrder.save();
        io.emit('newOrder', newOrder);
        io.to(newOrder._id.toString()).emit('orderStatusChanged', {
            orderId: newOrder._id,
            status: newOrder.status,
            estimatedDeliveryMins: newOrder.estimatedDeliveryMins
        });

        res.status(201).json({ status: 'success', data: newOrder });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ status: 'error', message: 'Order placement failed' });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status, driverLat, driverLng, driverId } = req.body;
        const orderId = req.params.id;

        const updateData: any = { status };
        if (driverId) updateData.driverId = driverId;

        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        io.to(orderId).emit('orderStatusChanged', {
            status,
            orderId,
            driverLocation: driverLat && driverLng ? { lat: driverLat, lng: driverLng } : null
        });

        res.json({ status: 'success', data: order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ status: 'error', message: 'Update failed' });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('restaurantId driverId');
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }
        res.json({ status: 'success', data: order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching order' });
    }
};

export const sendOrderMessage = async (req: Request, res: Response) => {
    try {
        const { sender, text } = req.body;
        if (!text) {
            return res.status(400).json({ status: 'error', message: 'Message text is required' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        const message = {
            sender: sender || 'user',
            text,
            createdAt: new Date()
        };

        order.chatMessages.push(message as any);
        await order.save();

        io.to(req.params.id).emit('orderMessage', {
            orderId: req.params.id,
            message
        });

        res.json({ status: 'success', data: message });
    } catch (error) {
        console.error('Send order message error:', error);
        res.status(500).json({ status: 'error', message: 'Unable to send message' });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('restaurantId').sort({ createdAt: -1 });
        res.json({ status: 'success', data: orders });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching orders' });
    }
};

export const getVendorOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
        res.json({ status: 'success', data: orders });
    } catch (error) {
        console.error('Get vendor orders error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching vendor orders' });
    }
};

export const getActiveOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await Order.find({ status: { $ne: 'delivered' } }).populate('restaurantId');
        res.json({ status: 'success', data: orders });
    } catch (error) {
        console.error('Get active orders error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching active orders' });
    }
};
