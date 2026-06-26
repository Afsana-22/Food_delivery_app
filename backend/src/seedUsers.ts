import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './db';

const seedUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/zaptaste');
    console.log('MongoDB connected for user seeding.');

    // Clear existing users to avoid duplicates in this demo flow
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@zaptaste.com',
        phone: '9999999999',
        password: hashedPassword,
        role: 'admin',
        isApproved: true
      },
      {
        name: 'Demo Vendor',
        email: 'vendor@zaptaste.com',
        phone: '8888888888',
        password: hashedPassword,
        role: 'vendor',
        isApproved: true
      },
      {
        name: 'Demo Driver',
        email: 'driver@zaptaste.com',
        phone: '7777777777',
        password: hashedPassword,
        role: 'driver',
        isApproved: true
      },
      {
        name: 'Demo Customer',
        email: 'user@zaptaste.com',
        phone: '6666666666',
        password: hashedPassword,
        role: 'customer',
        isApproved: true
      }
    ];

    await User.insertMany(defaultUsers);
    console.log('Successfully seeded default users!');
    process.exit(0);
  } catch (error) {
    console.error('User seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
