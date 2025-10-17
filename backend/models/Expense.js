const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  shop_name: {
    type: String,
    required: true,
    trim: true
  },
  detail: {
    type: String,
    required: false,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['eating', 'traveling', 'accommodation', 'equipment', 'other'],
    default: 'other'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  receiptFile: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
