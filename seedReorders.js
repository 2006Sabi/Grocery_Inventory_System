const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reorder = require('./models/Reorder');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dummyReorders = [
  {
    productName: "Milk",
    supplierName: "Local Dairy",
    suggestedQuantity: 50,
    autoReorder: true,
    status: "PENDING"
  },
  {
    productName: "Rice",
    supplierName: "Rice Supplier",
    suggestedQuantity: 100,
    autoReorder: false,
    status: "ORDERED"
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await Reorder.deleteMany();
    await Reorder.insertMany(dummyReorders);

    console.log('Dummy reorder data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
