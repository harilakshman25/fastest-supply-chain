const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      // coordinates: {
      //   type: String,
      //   default: 'Point',
      //   enum: ['Point']
      // },
      // coords: [Number]
    },
    contactNumber: String,
    email: String,
    operatingHours: {
      open: String,
      close: String
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    salesHistory: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for geospatial queries
// StoreSchema.index({ "address.coordinates": "2dsphere" });

module.exports = mongoose.model('Store', StoreSchema);
