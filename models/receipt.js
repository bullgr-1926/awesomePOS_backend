const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const defaultDate = require("./Helperfunctions");

const Receipt = new Schema({
  products: {
    type: [],
  },
  userId: {
    type: String,
    trim: true,
    required: true,
  },
  receiptDate: {
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
  createdAt: {
    type: String,
    default: defaultDate.createLocaleDateString(),
  },
});

module.exports = mongoose.model("Receipts", Receipt);
