const seedRestaurants = [
  {
    "name": "Bell Hotel",
    "city": "Sivakasi",
    "address": "Main Road, Sivakasi",
    "cuisine": ["South Indian", "Non-Veg"],
    "image": "https://gos3.ibcdn.com/8927fd348f2b11e88ea00a052ace0bec.jpg",
    "rating": 4,
    "menu": [
      { "name": "Meals (Full meals)", "price": 150, "category": "lunch", "image": "/restaurants/meals.jpg" },
      { "name": "Parotta + Salna", "price": 60, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Chicken Biryani", "price": 200, "category": "lunch", "image": "/restaurants/biryani.png" },
      { "name": "Mutton Curry", "price": 280, "category": "dinner", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Idli", "price": 40, "category": "breakfast", "image": "/restaurants/idli.png" },
      { "name": "Dosa", "price": 60, "category": "breakfast", "image": "/restaurants/kari_dosa.png" },
      { "name": "Pongal", "price": 50, "category": "breakfast", "image": "/restaurants/pongal.png" },
      { "name": "Chapati", "price": 50, "category": "dinner", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800" },
      { "name": "Egg Curry", "price": 120, "category": "lunch", "image": "/restaurants/egg_curry.png" },
      { "name": "Fried Rice", "price": 150, "category": "dinner", "image": "/restaurants/fried_rice.png" }
    ],
    "lat": 9.455, "lng": 77.8, "demandLevel": "high", "avgDeliveryMins": 20, "serviceRadiusKm": 10
  },
  {
    "name": "Marutham Multi Cuisine Restaurant",
    "city": "Sivakasi",
    "address": "Bypass, Sivakasi",
    "cuisine": ["Multi-Cuisine", "Chinese", "North Indian"],
    "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/03/77/57/76/marutham-multi-cuisine.jpg?w=900&h=500&s=1",
    "rating": 4,
    "menu": [
      { "name": "Chicken Fried Rice", "price": 180, "category": "dinner", "image": "/restaurants/chicken_fried_rice.png" },
      { "name": "Noodles", "price": 160, "category": "dinner", "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800" },
      { "name": "Paneer Butter Masala", "price": 200, "category": "lunch", "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800" },
      { "name": "Butter Naan", "price": 50, "category": "lunch", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800" },
      { "name": "Chicken 65", "price": 160, "category": "starter", "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800" },
      { "name": "Gobi Manchurian", "price": 140, "category": "starter", "image": "/restaurants/gobi_manchurian.png" },
      { "name": "Veg Meals", "price": 120, "category": "lunch", "image": "/restaurants/veg_meals.png" },
      { "name": "Egg Fried Rice", "price": 150, "category": "dinner", "image": "/restaurants/egg_fried_rice.png" },
      { "name": "Parotta", "price": 50, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Soup varieties", "price": 80, "category": "starter", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800" }
    ],
    "lat": 9.45, "lng": 77.805, "demandLevel": "medium", "avgDeliveryMins": 25, "serviceRadiusKm": 10
  },
  {
    "name": "Pizzakaaran",
    "city": "Sivakasi",
    "address": "Downtown, Sivakasi",
    "cuisine": ["Italian", "Fast Food"],
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000",
    "rating": 4.1,
    "menu": [
      { "name": "Chicken Pizza", "price": 250, "category": "dinner", "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" },
      { "name": "Veg Pizza", "price": 200, "category": "dinner", "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
      { "name": "Cheese Burst Pizza", "price": 300, "category": "dinner", "image": "https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800" },
      { "name": "Burger", "price": 150, "category": "lunch", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
      { "name": "French Fries", "price": 100, "category": "starter", "image": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800" },
      { "name": "Pasta", "price": 180, "category": "lunch", "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800" },
      { "name": "Sandwich", "price": 120, "category": "breakfast", "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800" },
      { "name": "Chicken Wings", "price": 220, "category": "starter", "image": "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=800" },
      { "name": "Mojito", "price": 100, "category": "drink", "image": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800" },
      { "name": "Milkshakes", "price": 120, "category": "drink", "image": "/restaurants/milkshake.jpg" }
    ],
    "lat": 9.458, "lng": 77.801, "demandLevel": "high", "avgDeliveryMins": 15, "serviceRadiusKm": 10
  },
  {
    "name": "Burma Kadai",
    "city": "Virudhunagar",
    "address": "Bazaar Road, Virudhunagar",
    "cuisine": ["South Indian", "Non-Veg"],
    "image": "https://d2kihw5e8drjh5.cloudfront.net/eyJidWNrZXQiOiJ1dGEtaW1hZ2VzIiwia2V5IjoicGxhY2VfaW1nL3BvWHlHQTJzUmtTa2JuVjZMOXFfeFEiLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjY0MCwiaGVpZ2h0Ijo2NDAsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsInRvRm9ybWF0IjogIndlYnAifX0=",
    "rating": 3.9,
    "menu": [
      { "name": "Parotta", "price": 40, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Poricha Parotta", "price": 50, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Chicken Curry", "price": 180, "category": "lunch", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Mutton Curry", "price": 250, "category": "lunch", "image": "/restaurants/mutton_curry.jpg" },
      { "name": "Biryani", "price": 180, "category": "lunch", "image": "/restaurants/biryani.png" },
      { "name": "Egg Kothu Parotta", "price": 120, "category": "dinner", "image": "/restaurants/kothu_parotta.png" },
      { "name": "Chicken Chukka", "price": 200, "category": "dinner", "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800" },
      { "name": "Meals", "price": 100, "category": "lunch", "image": "/restaurants/meals.jpg" },
      { "name": "Fish Fry", "price": 150, "category": "lunch", "image": "/restaurants/fish_fry.jpg" },
      { "name": "Omelette", "price": 30, "category": "starter", "image": "/restaurants/omelette.png" }
    ],
    "lat": 9.585, "lng": 77.95, "demandLevel": "high", "avgDeliveryMins": 22, "serviceRadiusKm": 10
  },
  {
    "name": "Famous Biryani House",
    "city": "Virudhunagar",
    "address": "Railway Station Rd, Virudhunagar",
    "cuisine": ["Biryani", "Mughlai"],
    "image": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEPcvC5VKzR9wVbe3OcPaFZ3SYXNzO1YJus5AdC78T-SbhQe9RNEPWj3HS-iA8E8KZTzDN8y7P5nGUwRjhmavFXlD7CU_DBI1Jc5jx0FTYhjN5teOHmYqT6lIHbRsbRyVr8aPhmXsy95mFp=s1360-w1360-h1020-rw",
    "rating": 4.7,
    "menu": [
      { "name": "Mutton Biryani", "price": 280, "category": "lunch", "image": "/restaurants/biryani.png" },
      { "name": "Chicken Biryani", "price": 200, "category": "lunch", "image": "/restaurants/chicken_biryani.jpg" },
      { "name": "Egg Biryani", "price": 150, "category": "lunch", "image": "/restaurants/egg_biryani.jpg" },
      { "name": "Veg Biryani", "price": 130, "category": "lunch", "image": "/restaurants/veg_biryani.jpg" },
      { "name": "Chicken 65", "price": 160, "category": "starter", "image": "/restaurants/chicken_65.jpg" },
      { "name": "Raita", "price": 30, "category": "starter", "image": "/restaurants/raita.jpg" },
      { "name": "Gravy", "price": 40, "category": "starter", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Tandoori Chicken", "price": 350, "category": "starter", "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800" },
      { "name": "Kebabs", "price": 220, "category": "starter", "image": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800" },
      { "name": "Soft drinks", "price": 40, "category": "drink", "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800" }
    ],
    "lat": 9.588, "lng": 77.958, "demandLevel": "medium", "avgDeliveryMins": 30, "serviceRadiusKm": 10
  },
  {
    "name": "Kathiravan Mess",
    "city": "Virudhunagar",
    "address": "Old Town, Virudhunagar",
    "cuisine": ["South Indian", "Homestyle"],
    "image": "/restaurants/hotel_kathiravan.png",
    "rating": 4.2,
    "menu": [
      { "name": "Meals", "price": 100, "category": "lunch", "image": "/restaurants/meals.jpg" },
      { "name": "Sambar Rice", "price": 60, "category": "lunch", "image": "/restaurants/sambar_rice.png" },
      { "name": "Curd Rice", "price": 50, "category": "lunch", "image": "/restaurants/curd_rice.png" },
      { "name": "Rasam", "price": 30, "category": "lunch", "image": "/restaurants/rasam.png" },
      { "name": "Vegetable Curry", "price": 70, "category": "lunch", "image": "/restaurants/vegetable_curry.png" },
      { "name": "Chicken Curry", "price": 150, "category": "lunch", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Fish Curry", "price": 160, "category": "lunch", "image": "/restaurants/fish_curry.png" },
      { "name": "Parotta", "price": 40, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Idli", "price": 30, "category": "breakfast", "image": "/restaurants/idli.png" },
      { "name": "Dosa", "price": 50, "category": "breakfast", "image": "/restaurants/dosa.jpg" }
    ],
    "lat": 9.58, "lng": 77.952, "demandLevel": "high", "avgDeliveryMins": 18, "serviceRadiusKm": 10
  },
  {
    "name": "Kumar Mess",
    "city": "Madurai",
    "address": "KK Nagar, Madurai",
    "cuisine": ["Chettinad", "Non-Veg"],
    "image": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1000",
    "rating": 4.1,
    "menu": [
      { "name": "Chicken Curry Dosa", "price": 160, "category": "dinner", "image": "/restaurants/kari_dosa.png" },
      { "name": "Mutton Chukka", "price": 260, "category": "dinner", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Parotta + Salna", "price": 60, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Chicken Biryani", "price": 220, "category": "lunch", "image": "/restaurants/biryani.png" },
      { "name": "Egg Kothu Parotta", "price": 140, "category": "dinner", "image": "/restaurants/kothu_parotta.png" },
      { "name": "Fish Fry", "price": 180, "category": "lunch", "image": "/restaurants/fish_fry.jpg" },
      { "name": "Meals", "price": 120, "category": "lunch", "image": "/restaurants/meals.jpg" },
      { "name": "Omelette", "price": 40, "category": "starter", "image": "/restaurants/omelette.png" },
      { "name": "Pepper Chicken", "price": 200, "category": "starter", "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800" },
      { "name": "Grill Chicken", "price": 380, "category": "starter", "image": "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800" }
    ],
    "lat": 9.92, "lng": 78.115, "demandLevel": "high", "avgDeliveryMins": 20, "serviceRadiusKm": 10
  },
  {
    "name": "Amma Mess",
    "city": "Madurai",
    "address": "Tallakulam, Madurai",
    "cuisine": ["South Indian", "Homestyle"],
    "image": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGTg0NofSOjf97Htkx-1GX-0JZkRDNHkmGYOelSJqtaKS6_pQAsGvIbSz6mWPReElXy5mtwK64ZL7wv_xoEJcEhPN2N1f05sBjzt2IUZ6mXJp72ctWNO1le-qBmrqijZKFXuWGJ=s1360-w1360-h1020-rw",
    "rating": 3.8,
    "menu": [
      { "name": "Meals", "price": 110, "category": "lunch", "image": "/restaurants/meals.jpg" },
      { "name": "Mutton Curry", "price": 240, "category": "lunch", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Chicken Curry", "price": 160, "category": "lunch", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Egg Curry", "price": 100, "category": "lunch", "image": "/restaurants/egg_curry.png" },
      { "name": "Fish Fry", "price": 160, "category": "lunch", "image": "/restaurants/fish_fry.jpg" },
      { "name": "Parotta", "price": 40, "category": "dinner", "image": "/restaurants/parotta.png" },
      { "name": "Dosa", "price": 50, "category": "breakfast", "image": "/restaurants/kari_dosa.png" },
      { "name": "Rice + Gravy", "price": 80, "category": "lunch", "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800" },
      { "name": "Kothu Parotta", "price": 130, "category": "dinner", "image": "/restaurants/kothu_parotta.png" },
      { "name": "Soup", "price": 60, "category": "starter", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800" }
    ],
    "lat": 9.93, "lng": 78.12, "demandLevel": "medium", "avgDeliveryMins": 25, "serviceRadiusKm": 10
  },
  {
    "name": "Famous Jigarthanda",
    "city": "Madurai",
    "address": "East Marret Street, Madurai",
    "cuisine": ["Desserts", "Beverages"],
    "image": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGo0V3vl3qgGr1lr6lXBrz6H8OsjfVvG2j3-ONy5abWoUNVhMSvSm9NmRmC0KBD9QMzqkh3Fd-7kmK1wOPXmWUpVLFQunGiaQLjcWWcqFH4dRAh73beEqAZnHXin2bEU_Dr5d-e_MuPWjU=s1360-w1360-h1020-rw",
    "rating": 4.5,
    "menu": [
      { "name": "Jigarthanda", "price": 80, "category": "drink", "image": "/restaurants/jigarthanda.jpg" },
      { "name": "Falooda", "price": 120, "category": "dessert", "image": "/restaurants/falooda.jpg" },
      { "name": "Ice Cream", "price": 60, "category": "dessert", "image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800" },
      { "name": "Milkshake", "price": 90, "category": "drink", "image": "/restaurants/milkshake.jpg" },
      { "name": "Rose Milk", "price": 50, "category": "drink", "image": "/restaurants/rose_milk.jpg" },
      { "name": "Badam Milk", "price": 60, "category": "drink", "image": "/restaurants/badam_milk.jpg" },
      { "name": "Cold Coffee", "price": 70, "category": "drink", "image": "/restaurants/cold cofee.jpg" },
      { "name": "Kulfi", "price": 50, "category": "dessert", "image": "/restaurants/kulfi.jpg" },
      { "name": "Fruit Salad", "price": 80, "category": "dessert", "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800" },
      { "name": "Lassi", "price": 50, "category": "drink", "image": "/restaurants/lassi.jpg" }
    ],
    "lat": 9.925, "lng": 78.11, "demandLevel": "high", "avgDeliveryMins": 10, "serviceRadiusKm": 10
  },
  {
    "name": "Aasife Biriyani",
    "city": "Madurai",
    "address": "Bypass Road, Madurai",
    "cuisine": ["Biryani", "Mughlai", "North Indian"],
    "image": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGIgtHt4stLY6ccuFc-_sWa5wUjyFzCbUcJJpxyDq-nBmvnHNcbxd2n9xxr4uMCsv3HJC0zohqDWYmHT10_xHZWZJjI4ElsRuq62MlflNvZesT69FtJFDYLY0KFEM3MXF-rRrV90w=s220-w165-h220-n-k-no",
    "rating": 4.6,
    "menu": [
      { "name": "Chicken Biryani", "price": 240, "category": "lunch", "image": "/restaurants/chicken_biryani.jpg" },
      { "name": "Mutton Biryani", "price": 320, "category": "lunch", "image": "/restaurants/biryani.png" },
      { "name": "Egg Biryani", "price": 160, "category": "lunch", "image": "/restaurants/egg_biryani.jpg" },
      { "name": "Tandoori Chicken", "price": 380, "category": "starter", "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800" },
      { "name": "Butter Chicken", "price": 260, "category": "dinner", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
      { "name": "Naan", "price": 50, "category": "dinner", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800" },
      { "name": "Fried Rice", "price": 180, "category": "dinner", "image": "/restaurants/fried_rice.png" },
      { "name": "Chicken 65", "price": 180, "category": "starter", "image": "/restaurants/chicken_65.jpg" },
      { "name": "Kebabs", "price": 240, "category": "starter", "image": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800" },
      { "name": "Desserts", "price": 100, "category": "dessert", "image": "/restaurants/dessert.jpg" }
    ],
    "lat": 9.928, "lng": 78.125, "demandLevel": "medium", "avgDeliveryMins": 35, "serviceRadiusKm": 10
  }
];

module.exports = seedRestaurants;
