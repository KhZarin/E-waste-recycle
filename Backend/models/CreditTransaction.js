const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Koto kg e-waste recycle hoyeche
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    // Ei transaction e koto credit paoa gelo
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    // FR7 er submission id. Ek submission e duibar credit dewa thekate
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);