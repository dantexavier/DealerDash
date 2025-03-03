const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vin: { type: String, required: true, unique: true },
  stock: { type: String, required: true, unique: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  trim: { type: String },
  color: { type: String },
  mileage: { type: Number },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  purchaseLocation: { type: String },
  arrivalDate: { type: Date },
  reconStartDate: { type: Date },
  frontLineDate: { type: Date },
  listPrice: { type: Number },
  soldDate: { type: Date },
  soldPrice: { type: Number },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['purchased', 'in_transport', 'in_recon', 'ready', 'sold'], 
    default: 'purchased' 
  },
  reconCost: { type: Number, default: 0 },
  notes: { type: String },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
VehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);