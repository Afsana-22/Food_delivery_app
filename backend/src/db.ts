import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaptaste';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'vendor', 'driver'], default: 'customer' },
    isApproved: { type: Boolean, default: false },
    isPro: { type: Boolean, default: false },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: [String],
    localSpecialties: [String],
    regionTags: [String],
    rating: { type: Number, default: 0 },
    image: String,
    lat: Number,
    lng: Number,
    serviceRadiusKm: { type: Number, default: 8 },
    avgDeliveryMins: { type: Number, default: 28 },
    demandLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    demandScore: { type: Number, default: 0.5 },
    priceForTwo: { type: Number, default: 220 },
    ecoPackagingAvailable: { type: Boolean, default: true },
    languagesSupported: { type: [String], default: ['en', 'ta'] },
    isApproved: { type: Boolean, default: false },
    isHomeChef: { type: Boolean, default: false },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    menu: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: String,
        image: String,
        veg: { type: Boolean, default: true },
        isAvailable: { type: Boolean, default: true },
        tags: [String],
        isLocalSpecial: { type: Boolean, default: false },
        recommendedAddons: [{
            name: String,
            price: Number
        }],
        customizations: [{
            name: String,
            price: { type: Number, default: 0 }
        }],
        category: { type: String, enum: ['starter', 'drink', 'breakfast', 'lunch', 'dinner', 'dessert'], default: 'lunch' }
    }]
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        selectedCustomizations: [String],
        customInstructions: String
    }],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 40 },
    dynamicPricingMultiplier: { type: Number, default: 1 },
    couponCode: String,
    couponMeta: mongoose.Schema.Types.Mixed,
    ecoFriendly: { type: Boolean, default: false },
    customInstructions: String,
    scheduledFor: Date,
    estimatedDeliveryMins: { type: Number, default: 30 },
    deliveryZone: String,
    pricingBreakdown: mongoose.Schema.Types.Mixed,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    deliveryAddress: String,
    deliveryLat: Number,
    deliveryLng: Number,
    chatMessages: [{
        sender: { type: String, enum: ['user', 'driver', 'system'], default: 'system' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, default: 0 },
    flatDiscount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    festivalName: String,
    city: String,
    autoApply: { type: Boolean, default: false },
    expiryDate: Date,
    isActive: { type: Boolean, default: true }
});

export const Coupon = mongoose.model('Coupon', couponSchema);

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

export const Review = mongoose.model('Review', reviewSchema);
