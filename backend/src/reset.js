const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/zaptaste';

// Minimal Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    isApproved: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const restaurantSchema = new mongoose.Schema({
    name: String,
    city: String,
    address: String,
    cuisine: [String],
    image: String,
    rating: Number,
    lat: Number,
    lng: Number,
    serviceRadiusKm: Number,
    avgDeliveryMins: Number,
    demandLevel: String,
    isApproved: { type: Boolean, default: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    menu: [{ name: String, price: Number, category: String, image: String }]
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    festivalName: String,
    discountPercent: { type: Number, default: 0 },
    flatDiscount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    city: String,
    isActive: { type: Boolean, default: true },
    expiryDate: Date,
    autoApply: { type: Boolean, default: false }
});
const Coupon = mongoose.model('Coupon', couponSchema);

const RestaurantsData = require('./seedData');

const reset = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Coupon.deleteMany({});
        await mongoose.connection.db.collection('orders').deleteMany({});
        console.log('Cleared.');

        const hash = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Afsana',
            email: 'admin@zaptaste.com',
            password: hash,
            phone: '0000000000',
            role: 'admin',
            isApproved: true
        });
        console.log('Admin Created.');

        const restaurantsWithOwners = [];
        for (const restData of RestaurantsData) {
            const words = restData.name.split(' ').map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w);
            const emailName = words[0] === 'the' && words.length > 1 ? words[1] : words.slice(0, 2).join('');
            const vendorEmail = `${emailName}@zaptaste.com`;

            const vendor = await User.create({
                name: `${restData.name} Owner`,
                email: vendorEmail,
                password: hash,
                phone: '1234567890',
                role: 'vendor',
                isApproved: true
            });

            restaurantsWithOwners.push({
                ...restData,
                ownerId: vendor._id
            });
            console.log(`Created vendor: ${vendorEmail} / password123`);
        }

        await Restaurant.insertMany(restaurantsWithOwners);
        console.log('Vendors and Restaurants Seeded.');

        // Seed Coupons
        const coupons = [
            { code: 'SIVAKASI25', festivalName: 'Local Special', discountPercent: 25, minOrderAmount: 200, city: 'Sivakasi', autoApply: true },
            { code: 'MADURAI50', festivalName: 'City Launch', flatDiscount: 50, minOrderAmount: 300, city: 'Madurai', autoApply: true },
            { code: 'VIRUDHUNAGAR20', festivalName: 'Foodie Fest', discountPercent: 20, minOrderAmount: 150, city: 'Virudhunagar', autoApply: false },
            { code: 'ZAPTASTE', festivalName: 'Welcome Offer', discountPercent: 15, minOrderAmount: 100, autoApply: true }
        ];
        await Coupon.insertMany(coupons);
        console.log('Coupons Seeded.');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reset();
