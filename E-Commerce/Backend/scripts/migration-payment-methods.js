require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Pedido = require('../src/models/Pedido');
const connectDB = require('../src/config/database');

const migratePaymentMethods = async () => {
    try {
        await connectDB();
        console.log('Connected to DB...');

        const result = await Pedido.updateMany(
            { paymentMethod: { $exists: false } },
            { $set: { paymentMethod: 'card' } } // Defaulting to card for historical data
        );

        console.log(`Migration complete. Matched ${result.matchedCount} and modified ${result.modifiedCount} documents.`);

        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePaymentMethods();
