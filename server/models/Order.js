const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number,
        required: true
      }
    }],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod'
    },
    estimatedDeliveryTime: {
      type: Date
    },
    actualDeliveryTime: {
      type: Date
    },
    ratings: {
      store: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String
      },
      delivery: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String
      }
    },
    returnRequest: {
      status: {
        type: String,
        enum: ['none', 'requested', 'approved', 'processing', 'completed', 'rejected'],
        default: 'none'
      },
      reason: String,
      requestedAt: Date,
      approvedAt: Date,
      completedAt: Date
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coords: [Number]
    }
  },
  { timestamps: true }
);

OrderSchema.index({ "deliveryAddress.coordinates": "2dsphere" });

module.exports = mongoose.model('Order', OrderSchema);
