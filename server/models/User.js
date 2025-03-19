const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      // type: {
      //   type: String,
      //   enum: ['Point'],
      //   default: 'Point'
      // },
      // coordinates: {
      //   type: [Number],
      //   required: true
      // },
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'store_manager', 'delivery', 'admin']
    },
    isApproved: {
      type: Boolean,
      default: function() {
        // return this.role === 'user';
        return true;
      }
    },
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    metadata: {
      drivingLicense: String,
      qualification: String
    }
  },
  { timestamps: true }
);

// Index for geospatial queries
// UserSchema.index({ "address.coordinates": "2dsphere" });

module.exports = mongoose.model('User', UserSchema);
