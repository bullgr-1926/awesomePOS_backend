const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Category = new Schema({
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
  color: {
    type: String,
    required: true,
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
    default: new Date(),
  },
});

module.exports = mongoose.model("Categories", Category);
