require('dotenv').config();
const mongoose = require('mongoose');
const RecyclingPoint = require('./models/RecyclingPoint');

// Sample/demo data. Coordinates: [longitude, latitude], Dhaka er kachhakachhi
const points = [
  {
    name: 'EcoCollect Savar',
    address: 'Savar Bazar Road, Savar, Dhaka',
    area: 'Savar',
    location: { type: 'Point', coordinates: [90.268, 23.859] },
    acceptedTypes: ['smartphone', 'laptop', 'tablet', 'battery', 'charger'],
    openingHours: 'Sat-Thu 9:00 AM - 6:00 PM',
    status: 'open',
  },
  {
    name: 'GreenCycle Ashulia',
    address: 'Ashulia Bazar, Ashulia, Savar, Dhaka',
    area: 'Ashulia',
    location: { type: 'Point', coordinates: [90.293, 23.901] },
    acceptedTypes: ['smartphone', 'laptop', 'monitor', 'battery', 'charger'],
    openingHours: 'Sat-Thu 10:00 AM - 5:00 PM',
    status: 'open',
  },
  {
    name: 'Hemayetpur Green Hub',
    address: 'Hemayetpur, Savar, Dhaka',
    area: 'Hemayetpur',
    location: { type: 'Point', coordinates: [90.259, 23.782] },
    acceptedTypes: ['smartphone', 'laptop', 'television', 'desktop', 'battery'],
    openingHours: 'Sat-Thu 9:00 AM - 5:00 PM',
    status: 'open',
  },
  {
    name: 'Urban Miner Hub Uttara',
    address: 'Sector 7, Uttara, Dhaka',
    area: 'Uttara',
    location: { type: 'Point', coordinates: [90.38, 23.876] },
    acceptedTypes: [
      'smartphone',
      'laptop',
      'tablet',
      'television',
      'battery',
      'charger',
    ],
    openingHours: 'Daily 10:00 AM - 8:00 PM',
    status: 'open',
  },
  {
    name: 'TechRecycle Mirpur',
    address: 'Mirpur 10, Dhaka',
    area: 'Mirpur',
    location: { type: 'Point', coordinates: [90.369, 23.807] },
    acceptedTypes: [
      'laptop',
      'desktop',
      'monitor',
      'television',
      'battery',
      'charger',
    ],
    openingHours: 'Sat-Thu 9:00 AM - 7:00 PM',
    status: 'open',
  },
  {
    name: 'E-Waste Center Dhanmondi',
    address: 'Road 27, Dhanmondi, Dhaka',
    area: 'Dhanmondi',
    location: { type: 'Point', coordinates: [90.3745, 23.7465] },
    acceptedTypes: [
      'smartphone',
      'laptop',
      'tablet',
      'desktop',
      'battery',
      'charger',
      'other',
    ],
    openingHours: 'Sat-Thu 9:00 AM - 6:00 PM',
    status: 'open',
  },
  {
    name: 'Recycle Point Mohammadpur',
    address: 'Town Hall Road, Mohammadpur, Dhaka',
    area: 'Mohammadpur',
    location: { type: 'Point', coordinates: [90.359, 23.7665] },
    acceptedTypes: ['television', 'monitor', 'desktop', 'other'],
    openingHours: 'Sat-Thu 9:00 AM - 5:00 PM',
    status: 'open',
  },
  {
    name: 'Eco Drop Gulshan',
    address: 'Gulshan Avenue, Gulshan, Dhaka',
    area: 'Gulshan',
    location: { type: 'Point', coordinates: [90.408, 23.793] },
    acceptedTypes: ['smartphone', 'tablet', 'laptop', 'charger'],
    openingHours: 'Daily 10:00 AM - 8:00 PM',
    status: 'temporarily closed',
  },
  {
    name: 'Motijheel Collection Point',
    address: 'Motijheel Commercial Area, Dhaka',
    area: 'Motijheel',
    location: { type: 'Point', coordinates: [90.4175, 23.7335] },
    acceptedTypes: ['smartphone', 'battery', 'charger', 'other'],
    openingHours: 'Sat-Thu 9:00 AM - 5:00 PM',
    status: 'open',
  },
  {
    name: 'Tongi Collection Point',
    address: 'Tongi Station Road, Tongi, Gazipur',
    area: 'Tongi',
    location: { type: 'Point', coordinates: [90.403, 23.89] },
    acceptedTypes: ['monitor', 'television', 'battery', 'other'],
    openingHours: 'Sat-Thu 9:00 AM - 4:00 PM',
    status: 'closed',
  },
];

const seedPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // 2dsphere index toiri hoyeche kina nishchit kore
    await RecyclingPoint.init();

    await RecyclingPoint.deleteMany();
    await RecyclingPoint.insertMany(points);

    console.log(`${points.length} recycling points added`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
    process.exit(1);
  }
};

seedPoints();