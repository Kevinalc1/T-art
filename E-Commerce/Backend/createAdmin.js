require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/database');

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            if (!userExists.isAdmin) {
                userExists.isAdmin = true;
                await userExists.save();
                console.log('User updated to admin');
            }
        } else {
            const user = await User.create({
                email: adminEmail,
                password: adminPassword,
                isAdmin: true
            });
            console.log('Admin user created');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
