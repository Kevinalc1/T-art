require('dotenv').config({ path: '../.env' }); // Adjust path to root .env
const mongoose = require('mongoose');
const User = require('../src/models/User'); // Adjust path to User model
const connectDB = require('../src/config/database');
const bcrypt = require('bcryptjs');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node scripts/test-login.js <email> <password>');
    process.exit(1);
}

const testLogin = async () => {
    try {
        console.log('Connecting to DB...');
        // Manually connect using MONGODB_URI from loaded env
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log(`Searching for user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.error('❌ User not found in database.');
            process.exit(1);
        }

        console.log('✓ User found.');
        console.log(`  ID: ${user._id}`);
        console.log(`  Is Admin: ${user.isAdmin}`);
        console.log(`  Password Hash (length): ${user.password ? user.password.length : 'NULL'}`);

        if (!user.password) {
            console.error('❌ User has NO password set (maybe only Social Login?).');
            process.exit(1);
        }

        console.log('Testing password match...');
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('✅ SUCCESS: Password matches!');
        } else {
            console.error('❌ FAILURE: Password does NOT match.');
            console.log('Possibilities:');
            console.log('1. User entered wrong password.');
            console.log('2. Password in DB is not hashed (plaintext).');
            console.log('3. Password in DB is hashed with different salt/rounds.');

            // Check if password stored is plaintext
            if (user.password === password) {
                console.log('!!! CRITICAL: Password is stored in PLAINTEXT. This breaks login.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

testLogin();
