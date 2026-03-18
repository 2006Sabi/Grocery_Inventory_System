const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reorder = require('./models/Reorder');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const reorders = await Reorder.find({});
    console.log('Current Reorders in DB:');
    reorders.forEach(r => {
      console.log(`ID: ${r._id}, Product: ${r.productName}, Status: ${r.status}`);
    });
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
