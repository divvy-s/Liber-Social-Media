const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: { type: String, enum: ['like', 'comment', 'follow', 'repost'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // actor
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  content: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 