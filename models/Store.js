const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Store = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  tax: {
    type: Number,
    trim: true,
    required: true,
    min: 0,
    max: 100,
    default: 19,
  },
  currency: {
    type: String,
    trim: true,
    required: true,
    maxLength: 3,
    default: "€",
  },
  street: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  city: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  region: {
    type: String,
    trim: true,
    maxLength: 30,
  },
  postcode: {
    type: Number,
    trim: true,
    required: true,
    min: 0,
  },
  phone: {
    type: Number,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    maxLength: 30,
  },
});

module.exports = mongoose.model("Store", Store);
