const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Receipt = new Schema({
  products: {
    type: [],
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
  },
  subTotal: {
    type: Number,
    min: 0,
  },
  total: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Receipts", Receipt);
