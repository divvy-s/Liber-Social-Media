const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String },
  nftTokenId: { type: String },
  ipfsHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema); 