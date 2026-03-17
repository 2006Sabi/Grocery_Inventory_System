const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');

dotenv.config();

const groceryData = [
  {
    category: "Grains & Staples",
    products: ["Basmati Rice", "Ponni Rice", "Wheat Flour", "Maida", "Rava", "Toor Dal", "Urad Dal", "Moong Dal", "Oats", "Millets"]
  },
  {
    category: "Dairy",
    products: ["Milk", "Curd", "Paneer", "Butter", "Cheese", "Ghee", "Cream"]
  },
  {
    category: "Snacks & Packaged Foods",
    products: ["Chips", "Biscuits", "Namkeen", "Instant Noodles", "Pasta", "Chocolates", "Popcorn"]
  },
  {
    category: "Beverages",
    products: ["Soft Drinks", "Fruit Juice", "Tea Powder", "Coffee Powder", "Energy Drinks", "Boost / Horlicks"]
  },
  {
    category: "Fruits & Vegetables",
    products: ["Apple", "Banana", "Orange", "Onion", "Potato", "Tomato", "Carrot", "Beans", "Spinach"]
  },
  {
    category: "Personal Care",
    products: ["Soap", "Shampoo", "Toothpaste", "Toothbrush", "Face Wash", "Hair Oil"]
  },
  {
    category: "Household & Cleaning",
    products: ["Detergent", "Dishwash Liquid", "Floor Cleaner", "Toilet Cleaner", "Garbage Bags"]
  },
  {
    category: "Packaged & Grocery",
    products: ["Tomato Ketchup", "Pickles", "Jam", "Peanut Butter", "Sauces"]
  },
  {
    category: "Dry Fruits & Nuts",
    products: ["Almonds", "Cashews", "Raisins", "Pistachios", "Walnuts"]
  },
  {
    category: "Frozen & Meat",
    products: ["Chicken", "Fish", "Frozen Vegetables", "Ice Cream"]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // 1. Ensure a default supplier exists
    let supplier = await Supplier.findOne();
    if (!supplier) {
      supplier = await Supplier.create({
        name: "Main Grocery Hub",
        phone: "1234567890",
        email: "hub@grocery.com",
        address: "123 Market Street"
      });
      console.log('Created default supplier');
    }

    // 2. Process Categories and Products
    for (const item of groceryData) {
      // Create or get category
      let category = await Category.findOne({ name: item.category });
      if (!category) {
        category = await Category.create({ name: item.category, description: `${item.category} section` });
        console.log(`Created category: ${item.category}`);
      }

      for (const productName of item.products) {
        const productExists = await Product.findOne({ name: productName });
        if (!productExists) {
          await Product.create({
            name: productName,
            barcode: `BC${Math.random().toString().slice(2, 10)}`,
            categoryId: category._id,
            price: Math.floor(Math.random() * 500) + 10,
            stock: Math.floor(Math.random() * 100) + 20,
            threshold: 10,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            supplierId: supplier._id
          });
          console.log(`Added product: ${productName}`);
        }
      }
    }

    console.log('Seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
