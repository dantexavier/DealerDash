const mongoose = require('mongoose');

const LaborSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  hours: { type: Number, required: true },
  standardHours: { type: Number, required: true }, // Industry standard time for the task
  cost: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  completed: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
LaborSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Labor', LaborSchema);