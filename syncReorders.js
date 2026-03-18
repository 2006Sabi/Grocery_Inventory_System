const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const Reorder = require('./models/Reorder');
const Supplier = require('./models/Supplier');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const syncReorders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for sync process...');

        const lowStockProducts = await Product.find({
            autoReorder: true,
            $expr: { $lte: ['$stock', '$threshold'] }
        }).populate('supplierId');

        console.log(`Found ${lowStockProducts.length} low stock products with autoReorder enabled.`);

        for (const product of lowStockProducts) {
            const pendingReorder = await Reorder.findOne({ 
                productId: product._id, 
                status: 'PENDING' 
            });

            if (!pendingReorder) {
                const supplierName = product.supplierId ? product.supplierId.name : 'Unknown Supplier';
                
                await Reorder.create({
                    productId: product._id,
                    productName: product.name,
                    supplierId: product.supplierId ? product.supplierId._id : null,
                    supplierName: supplierName,
                    suggestedQuantity: product.threshold * 2,
                    status: 'PENDING',
                    autoReorder: true
                });
                console.log(`Created auto-reorder for: ${product.name}`);
            } else {
                console.log(`Pending reorder already exists for: ${product.name}`);
            }
        }

        console.log('Sync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error during sync:', error.message);
        process.exit(1);
    }
};

syncReorders();
