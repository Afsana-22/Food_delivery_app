import mongoose from 'mongoose';
import { Restaurant } from './db';

const SivakasiRestaurants = [
  {
    name: "The Burma Shop",
    city: "Sivakasi",
    address: "Bypass Road, Sivakasi",
    cuisine: ["Burmese", "Street Food", "Asian"],
    image: "https://images.unsplash.com/photo-1555126634-ba943c2bc164?auto=format&fit=crop&q=80&w=1000",
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
    ecoPackagingAvailable: true,
    languagesSupported: ["en"],
    isApproved: true,
    isHomeChef: false,
    menu: [
      { name: "Atho Fry", price: 120, description: "Classic Burmese noodle dish pan-fried with cabbage, onions and secret spices", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
      { name: "Egg Bejo", price: 60, description: "Crispy chickpea flour snack served with soup and egg", veg: false, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800" },
      { name: "Mohinga Soup", price: 80, description: "Traditional Burmese fish noodle soup", veg: false, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800" },
      { name: "Chicken Atho", price: 150, description: "Atho tossed with shredded chicken", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1526318896980-cf38c0885652?w=800" },
      { name: "Burmese Rose Milk", price: 50, description: "Refreshing sweet drink with a hint of rose", veg: true, isAvailable: true, category: "drink", image: "https://images.unsplash.com/photo-1553177595-4de2bb0842b9?w=800" },
      { name: "Egg Masala Mutton Atho", price: 190, description: "Spicy mutton mixed with noodles and egg", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1582576163090-6c51e01f5bf1?w=800" }
    ]
  },
  {
    name: "Janakiram Hotel",
    city: "Sivakasi",
    address: "Palaniandavar Puram Colony, Sivakasi",
    cuisine: ["South Indian", "Traditional", "Meals"],
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=1000",
    localSpecialties: ["Mutton Chukka", "Kari Dosa", "Nannari Sarbath"],
    regionTags: ["Sivakasi_East"],
    rating: 4.6,
    lat: 9.458,
    lng: 77.795,
    serviceRadiusKm: 15,
    avgDeliveryMins: 35,
    demandLevel: "medium",
    demandScore: 0.8,
    priceForTwo: 450,
    ecoPackagingAvailable: false,
    languagesSupported: ["en"],
    isApproved: true,
    isHomeChef: false,
    menu: [
      { name: "Mutton Kari Dosa", price: 220, description: "Thick dosa topped with spicy minced mutton and egg", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800" },
      { name: "Mutton Chukka", price: 250, description: "Dry roasted mutton with pepper and curry leaves", veg: false, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?w=800" },
      { name: "Full Non-Veg Meals", price: 280, description: "Traditional rice meals with fish gravy, mutton kuzhambu and chicken 65", veg: false, isAvailable: true, category: "lunch", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800" },
      { name: "Chicken Biryani", price: 200, description: "Seeraga samba rice biryani cooked with tender chicken", veg: false, isAvailable: true, category: "lunch", image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800" },
      { name: "Idiyappam with Paya", price: 180, description: "String hoppers served with rich goat leg soup", veg: false, isAvailable: true, category: "breakfast", image: "https://images.unsplash.com/photo-1516714435131-44eb1d50c115?w=800" },
      { name: "Nannari Sarbath", price: 40, description: "Cooling herbal root drink with lime", veg: true, isAvailable: true, category: "drink", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
      { name: "Jigarthanda", price: 80, description: "Famous milk dessert drink with almond gum and ice cream", veg: true, isAvailable: true, category: "dessert", image: "https://images.unsplash.com/photo-1563805367882-444837be78a1?w=800" }
    ]
  },
  {
    name: "Sri Kaliswari Veg",
    city: "Sivakasi",
    address: "Near Bus Stand, Sivakasi",
    cuisine: ["Pure Veg", "South Indian", "Sweets"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&q=80&w=1000",
    localSpecialties: ["Ghee Roast", "Mini Tiffin"],
    regionTags: ["Sivakasi_Central"],
    rating: 4.4,
    lat: 9.450,
    lng: 77.792,
    serviceRadiusKm: 8,
    avgDeliveryMins: 20,
    demandLevel: "high",
    demandScore: 0.9,
    priceForTwo: 200,
    ecoPackagingAvailable: true,
    languagesSupported: ["en"],
    isApproved: true,
    isHomeChef: false,
    menu: [
      { name: "Ghee Roast Dosa", price: 80, description: "Crispy paper-thin dosa roasted in pure cow ghee", veg: true, isAvailable: true, category: "breakfast", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800" },
      { name: "Mini Tiffin Combo", price: 120, description: "Mini idlis, pongal, kesari, mini dosa, and vada", veg: true, isAvailable: true, category: "breakfast", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800" },
      { name: "Veg Special Meals", price: 150, description: "Elai saapadu with 3 veggies, sambar, rasam, payasam", veg: true, isAvailable: true, category: "lunch", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800" },
      { name: "Gobi 65", price: 110, description: "Spicy deep-fried cauliflower florets", veg: true, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?w=800" },
      { name: "Filter Coffee", price: 35, description: "Authentic Kumbakonam degree coffee", veg: true, isAvailable: true, category: "drink", image: "https://images.unsplash.com/photo-1544787210-22bb1e8163cc?w=800" },
      { name: "Chola Poori", price: 90, description: "Large fluffy poori served with spicy chana masala", veg: true, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800" },
      { name: "Badam Milk", price: 50, description: "Hot milk infused with crushed almonds and saffron", veg: true, isAvailable: true, category: "drink", image: "https://images.unsplash.com/photo-1553177595-4de2bb0842b9?w=800" }
    ]
  },
  {
    name: "Azhagar Kadai",
    city: "Sivakasi",
    address: "Main Bazaar, Sivakasi",
    cuisine: ["Fast Food", "Parotta"],
    image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&q=80&w=1000",
    localSpecialties: ["Kothu Parotta", "Salna"],
    regionTags: ["Sivakasi_Market"],
    rating: 4.7,
    lat: 9.460,
    lng: 77.790,
    serviceRadiusKm: 10,
    avgDeliveryMins: 30,
    demandLevel: "high",
    demandScore: 0.98,
    priceForTwo: 250,
    ecoPackagingAvailable: true,
    languagesSupported: ["en"],
    isApproved: true,
    isHomeChef: false,
    menu: [
      { name: "Chicken Kothu Parotta", price: 130, description: "Minced parotta tossed with egg, salna, and chicken chunks", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?w=800" },
      { name: "Egg Kalaki", price: 40, description: "Soft scrambled egg with savory salna liquid", veg: false, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1598233533939-3392fe9cb72a?w=800" },
      { name: "Nattu Kozhi Rasam", price: 60, description: "Spicy country chicken pepper soup", veg: false, isAvailable: true, category: "starter", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800" },
      { name: "Kari Dosa", price: 180, description: "South Indian pizza topped with minced meat", veg: false, isAvailable: true, category: "dinner", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800" },
      { name: "Chicken 65 Biryani", price: 190, description: "Biryani rice topped with spicy chicken 65 pieces", veg: false, isAvailable: true, category: "lunch", image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800" },
      { name: "Sweet Lassi", price: 50, description: "Fresh thick yogurt drink", veg: true, isAvailable: true, category: "drink", image: "https://images.unsplash.com/photo-1553177595-4de2bb0842b9?w=800" }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/zaptaste');
    console.log('MongoDB connected for seeding.');

    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants.');

    await Restaurant.insertMany(SivakasiRestaurants);
    console.log('Successfully seeded Sivakasi Restaurants!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
