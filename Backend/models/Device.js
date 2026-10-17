const mongoose = require('mongoose');
require('./Material');

// Device er moddhe ekta material er hishab
const compositionSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    // Device er total weight er koto % ei material
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Ei material er koto % recycle kore ber kora jay
    recoveryRate: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'smartphone',
        'laptop',
        'tablet',
        'television',
        'desktop',
        'monitor',
        'battery',
        'charger',
        'other',
      ],
    },
    // Ekta device er gora weight (kg)
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: 0,
    },
    // Onno naam ba shortcut, search er jonno (jemon "iphone 13")
    aliases: {
      type: [String],
      default: [],
    },
    composition: {
      type: [compositionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Naam, brand, model diye search korar jonno
deviceSchema.index({ name: 'text', brand: 'text', model: 'text', aliases: 'text' });

module.exports = mongoose.model('Device', deviceSchema);