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
  subTotal: {
    type: Number,
    min: 0,
  },
  taxTotal: {
    type: Number,
    min: 0,
  },
  grandTotal: {
    type: Number,
    min: 0,
  },
});

module.exports = mongoose.model("Receipts", Receipt);
