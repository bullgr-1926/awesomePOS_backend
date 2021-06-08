const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxLength: 20,
  },
  description: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    trim: true,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    trim: true,
    min: 0,
    max: 100,
    default: 0,
  },
  discountExpiration: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Products", Product);
