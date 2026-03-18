const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const sendEmail = require('../utils/emailService');
const { checkStockLevels } = require('../utils/inventoryService');

async function testEmailTriggers() {
    console.log('--- Starting Email Automation Test ---');

    // 1. Test Utility Directly
    console.log('\n1. Testing sendEmail utility directly...');
    const info = await sendEmail({
        email: process.env.EMAIL_USER || 'test@example.com',
        subject: 'Test Email - Inventory System',
        message: 'This is a test email to verify utility functionality.'
    });
    console.log(info ? 'Utility Test Passed' : 'Utility Test Failed (Check .env credentials)');

    // 2. Mock Product for Stock Alert
    console.log('\n2. Testing Stock Alert Logic...');
    const mockProduct = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Product',
        stock: 3,
        threshold: 5,
        autoReorder: false,
        storeId: new mongoose.Types.ObjectId(),
        save: async () => console.log('Mocked product.save() called')
    };

    // Note: This requires User to exist in DB for admin email lookup
    // For a real integration test, we'd need a test DB. 
    // Here we just verify the service doesn't crash if lookup fails.
    try {
        await checkStockLevels(mockProduct);
        console.log('Stock logic executed without crashing.');
    } catch (err) {
        console.error('Stock logic failed:', err.message);
    }

    console.log('\n--- Test Script Finished ---');
    console.log('Note: Admin/Staff/Supplier creation emails were integrated in controllers.');
    console.log('Verify by checking server console logs for "Email sent successfully".');
}

testEmailTriggers().then(() => process.exit());
