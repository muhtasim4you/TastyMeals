require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Restaurant = require("./models/Restaurant");
const User = require("./models/User");

const restaurants = [
  {
    name: "The Spice Garden",
    cuisine: "Indian",
    rating: 4.8,
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    description: "Authentic Indian cuisine with rich flavors and aromatic spices.",
    menu: [
      { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 14.99, category: "Main", rating: 4.9, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop" },
      { name: "Biryani", description: "Fragrant basmati rice with spiced meat and herbs", price: 12.99, category: "Main", rating: 4.8, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop" },
      { name: "Samosa", description: "Crispy pastry filled with spiced potatoes and peas", price: 5.99, category: "Appetizer", rating: 4.6, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop" },
      { name: "Naan Bread", description: "Soft tandoori bread with garlic butter", price: 3.99, category: "Sides", rating: 4.7, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop" },
      { name: "Mango Lassi", description: "Refreshing yogurt drink with mango", price: 4.99, category: "Drinks", rating: 4.5, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300&h=200&fit=crop" },
    ],
  },
  {
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.7,
    location: "Midtown",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop",
    description: "Premium Japanese sushi and sashimi made with the freshest fish.",
    menu: [
      { name: "Salmon Sushi Roll", description: "Fresh salmon with avocado and rice", price: 13.99, category: "Main", rating: 4.8, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop" },
      { name: "Ramen", description: "Rich tonkotsu broth with noodles and pork belly", price: 15.99, category: "Main", rating: 4.9, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop" },
      { name: "Tempura", description: "Lightly battered and fried shrimp and vegetables", price: 10.99, category: "Appetizer", rating: 4.5, image: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=300&h=200&fit=crop" },
      { name: "Edamame", description: "Steamed soybeans with sea salt", price: 4.99, category: "Appetizer", rating: 4.3, image: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=300&h=200&fit=crop" },
      { name: "Green Tea", description: "Traditional Japanese matcha tea", price: 3.49, category: "Drinks", rating: 4.4, image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=200&fit=crop" },
    ],
  },
  {
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.9,
    location: "Westside",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    description: "Classic Italian dishes made with imported ingredients and family recipes.",
    menu: [
      { name: "Margherita Pizza", description: "Classic pizza with tomato, mozzarella, and basil", price: 11.99, category: "Main", rating: 4.9, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop" },
      { name: "Pasta Carbonara", description: "Creamy pasta with bacon, egg, and parmesan", price: 13.99, category: "Main", rating: 4.8, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=200&fit=crop" },
      { name: "Bruschetta", description: "Toasted bread with tomatoes, garlic, and basil", price: 7.99, category: "Appetizer", rating: 4.6, image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop" },
      { name: "Tiramisu", description: "Coffee-flavored Italian dessert", price: 8.99, category: "Dessert", rating: 4.9, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop" },
      { name: "Espresso", description: "Strong Italian coffee", price: 2.99, category: "Drinks", rating: 4.7, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=200&fit=crop" },
    ],
  },
  {
    name: "Burger Bliss",
    cuisine: "American",
    rating: 4.6,
    location: "East End",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop",
    description: "Gourmet burgers with premium beef and creative toppings.",
    menu: [
      { name: "Classic Cheeseburger", description: "Angus beef with cheddar, lettuce, and tomato", price: 10.99, category: "Main", rating: 4.7, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop" },
      { name: "BBQ Bacon Burger", description: "Smoky BBQ sauce with crispy bacon", price: 13.99, category: "Main", rating: 4.8, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=200&fit=crop" },
      { name: "Onion Rings", description: "Crispy battered onion rings", price: 5.99, category: "Sides", rating: 4.4, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop" },
      { name: "Milkshake", description: "Thick creamy vanilla milkshake", price: 6.99, category: "Drinks", rating: 4.6, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop" },
      { name: "French Fries", description: "Golden crispy fries with seasoning", price: 4.49, category: "Sides", rating: 4.5, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop" },
    ],
  },
  {
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.5,
    location: "Chinatown",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
    description: "Traditional Chinese dishes with bold flavors and fresh ingredients.",
    menu: [
      { name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts", price: 12.99, category: "Main", rating: 4.6, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop" },
      { name: "Fried Rice", description: "Wok-fried rice with vegetables and egg", price: 9.99, category: "Main", rating: 4.5, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop" },
      { name: "Spring Rolls", description: "Crispy rolls with vegetable filling", price: 6.99, category: "Appetizer", rating: 4.4, image: "https://images.unsplash.com/photo-1548507200-e9e0e9199537?w=300&h=200&fit=crop" },
      { name: "Hot and Sour Soup", description: "Tangy spicy soup with tofu and mushrooms", price: 7.49, category: "Appetizer", rating: 4.3, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop" },
      { name: "Bubble Tea", description: "Milk tea with tapioca pearls", price: 5.99, category: "Drinks", rating: 4.7, image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=300&h=200&fit=crop" },
    ],
  },
  {
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.7,
    location: "Southside",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    description: "Vibrant Mexican flavors with authentic street food recipes.",
    menu: [
      { name: "Tacos Al Pastor", description: "Marinated pork tacos with pineapple salsa", price: 9.99, category: "Main", rating: 4.8, image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=300&h=200&fit=crop" },
      { name: "Burrito Bowl", description: "Rice bowl with beans, meat, and fresh toppings", price: 11.99, category: "Main", rating: 4.7, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=200&fit=crop" },
      { name: "Guacamole & Chips", description: "Fresh avocado dip with tortilla chips", price: 6.99, category: "Appetizer", rating: 4.6, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=300&h=200&fit=crop" },
      { name: "Churros", description: "Crispy fried dough with cinnamon sugar", price: 5.99, category: "Dessert", rating: 4.8, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=200&fit=crop" },
      { name: "Horchata", description: "Sweet cinnamon rice milk drink", price: 3.99, category: "Drinks", rating: 4.5, image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300&h=200&fit=crop" },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Restaurant.deleteMany({});
    console.log("Cleared existing restaurants");

    await Restaurant.insertMany(restaurants);
    console.log("Seeded 6 restaurants with menu items");

    const existingAdmin = await User.findOne({ email: "admin@tastymeals.com" });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Admin",
        email: "admin@tastymeals.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created (admin@tastymeals.com / admin123)");
    } else {
      console.log("Admin user already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
