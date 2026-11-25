const mongoose = require('mongoose');
const RecyclingPoint = require('./RecyclingPoint');
require('./User');

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recyclingPoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecyclingPoint',
      required: true,
    },
    deviceType: {
      type: String,
      required: [true, 'Device type is required'],
      enum: RecyclingPoint.DEVICE_CATEGORIES,
    },
    // Optional, jemon "iPhone 13"
    deviceName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    // Shob item er total weight (kg)
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: 0.001,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    // Confirm hole FR8 theke koto credit gelo
    creditsAwarded: {
      type: Number,
      default: 0,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecyclingSubmission', submissionSchema);