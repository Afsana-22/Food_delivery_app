import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, Restaurant, Order, Coupon, Review } from './db';

const SivakasiRestaurants = [
  {
    name: "The Burma Shop",
    city: "Sivakasi",
    address: "Bypass Road, Sivakasi",
    cuisine: ["Burmese", "Street Food", "Asian"],
    image: "/restaurants/burma_shop.png",
    localSpecialties: ["Atho", "Bejo", "Mohinga"],
    regionTags: ["Sivakasi_South"],
    rating: 4.8,
    lat: 9.456,
    lng: 77.800,
    serviceRadiusKm: 12,
    avgDeliveryMins: 25,
    demandLevel: "high",
    demandScore: 0.95,
    priceForTwo: 300,
    isApproved: true,
    menu: [
      { name: "Atho Fry", price: 120, category: "dinner", image: "/restaurants/atho_fry.png" },
      { name: "Egg Bejo", price: 60, category: "starter", image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800" },
      { name: "Mohinga Soup", price: 80, category: "starter", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800" }
    ]
  },
  {
    name: "Sri Ganapathi Mess",
    city: "Sivakasi",
    address: "Velayutham Road, Sivakasi",
    cuisine: ["South Indian", "Biryani", "Non-Veg"],
    image: "/restaurants/ganapathi_mess.png",
    rating: 4.9,
    lat: 9.4533,
    lng: 77.8024,
    priceForTwo: 260,
    isApproved: true,
    menu: [
      { name: "Sivakasi Special Biryani", price: 180, category: "lunch", image: "/restaurants/biryani.png" },
      { name: "Kari Dosa", price: 210, category: "dinner", image: "/restaurants/kari_dosa.png" },
      { name: "Kothu Parotta", price: 130, category: "dinner", image: "/restaurants/kothu_parotta.png" }
    ]
  },
  {
    name: "Sri Kaliswari Veg",
    city: "Sivakasi",
    address: "Near Bus Stand, Sivakasi",
    cuisine: ["Pure Veg", "South Indian"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&q=80&w=1000",
    rating: 4.4,
    lat: 9.450,
    lng: 77.792,
    priceForTwo: 200,
    isApproved: true,
    menu: [
      { name: "Ghee Roast Dosa", price: 80, category: "breakfast", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800" },
      { name: "Mini Tiffin Combo", price: 120, category: "breakfast", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800" }
    ]
  },
  {
    name: "Janakiram Hotel",
    city: "Sivakasi",
    address: "Palaniandavar Puram Colony, Sivakasi",
    cuisine: ["South Indian", "Non-Veg"],
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=1000",
    rating: 4.6,
    lat: 9.458,
    lng: 77.795,
    isApproved: true,
    menu: [
      { name: "Mutton Kari Dosa", price: 220, category: "dinner", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800" },
      { name: "Chicken Biryani", price: 200, category: "lunch", image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800" }
    ]
  },
  {
    name: "Azhagar Kadai",
    city: "Sivakasi",
    address: "Main Bazaar, Sivakasi",
    cuisine: ["Fast Food", "Parotta"],
    image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&q=80&w=1000",
    rating: 4.7,
    lat: 9.460,
    lng: 77.790,
    isApproved: true,
    menu: [
      { name: "Kothu Parotta", price: 130, category: "dinner", image: "https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?w=800" }
    ]
  }
];

const resetDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/zaptaste');
        console.log('MongoDB connected for reset.');

        // Clear all
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Order.deleteMany({});
        await Coupon.deleteMany({});
        await Review.deleteMany({});
        console.log('Database cleared.');

        // Seed Admin
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'System Admin',
            email: 'admin@zaptaste.com',
            password: hashedPassword,
            phone: '0000000000',
            role: 'admin',
            isApproved: true
        });
        console.log('Admin account created (admin@zaptaste.com / password123)');

        // Seed Restaurants
        await Restaurant.insertMany(SivakasiRestaurants);
        console.log('Restaurants initialized with real imagery.');

        process.exit(0);
    } catch (error) {
        console.error('Reset error:', error);
        process.exit(1);
    }
};

resetDB();
