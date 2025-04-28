const mongoose = require('mongoose');

const fitnessDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  steps: {
    type: Number,
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  activeMinutes: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for efficient queries
fitnessDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const FitnessData = mongoose.model('FitnessData', fitnessDataSchema);

module.exports = FitnessData; 