const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String },
  bio: { type: String },
  avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 