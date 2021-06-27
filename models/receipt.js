const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Receipt = new Schema({
  products: {
    type: [],
  },
  userId: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: String,
    trim: true,
    required: true,
  },
  tax: {
    type: Number,
    min: 0,
  },
  subtotal: {
    type: Number,
    min: 0,
  },
  taxtotal: {
    type: Number,
    min: 0,
  },
  grandtotal: {
    type: Number,
    min: 0,
  },
});

module.exports = mongoose.model("Receipts", Receipt);
