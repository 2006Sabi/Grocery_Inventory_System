const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Invoice = require('./models/Invoice');
const Category = require('./models/Category');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        console.log('Testing totalProducts...');
        const totalProducts = await Product.countDocuments({});
        console.log('Total Products:', totalProducts);

        console.log('Testing Today Sales...');
        const todaySales = await Invoice.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('Today Sales:', todaySales);

        console.log('Testing Category Distribution...');
        const categoryDistribution = await Product.aggregate([
            { $match: { categoryId: { $ne: null } } },
            {
                $group: {
                    _id: '$categoryId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$category.name', 'Uncategorized'] },
                    value: '$count'
                }
            }
        ]);
        console.log('Category Distribution:', categoryDistribution);

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

test();
