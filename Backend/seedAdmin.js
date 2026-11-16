require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@ewaste.com';
const ADMIN_PASSWORD = 'admin123'; // sudhu local development er jonno

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      console.log('Admin already exists');
    } else {
      await User.create({
        name: 'System Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();