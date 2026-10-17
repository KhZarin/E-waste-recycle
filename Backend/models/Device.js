const mongoose = require('mongoose');
require('./Material');

const compositionSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    
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
    
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: 0,
    },
  
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


deviceSchema.index({ name: 'text', brand: 'text', model: 'text', aliases: 'text' });

module.exports = mongoose.model('Device', deviceSchema);
