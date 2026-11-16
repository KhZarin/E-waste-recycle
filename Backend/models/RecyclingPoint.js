const mongoose = require('mongoose');

const DEVICE_CATEGORIES = [
  'smartphone',
  'laptop',
  'tablet',
  'television',
  'desktop',
  'monitor',
  'battery',
  'charger',
  'other',
];

const recyclingPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    // GeoJSON Point: coordinates = [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) => value.length === 2,
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    acceptedTypes: {
      type: [String],
      enum: DEVICE_CATEGORIES,
      default: [],
    },
    openingHours: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'temporarily closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Distance diye khujar jonno geospatial index
recyclingPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RecyclingPoint', recyclingPointSchema);
module.exports.DEVICE_CATEGORIES = DEVICE_CATEGORIES;