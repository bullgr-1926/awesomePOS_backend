const mongoose = require("mongoose");
require("mongoose-type-email");
const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    minLength: 8,
    maxLength: 16,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    lowercase: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
  },
  firstname: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  lastname: {
    type: String,
    trim: true,
    required: true,
    maxLength: 30,
  },
  role: {
    type: String,
    required: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Users", User);
