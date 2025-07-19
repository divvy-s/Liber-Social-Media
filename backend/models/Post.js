const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  nftTokenId: { type: String },
  ipfsHash: { type: String },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  upvotedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  downvotedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema); 