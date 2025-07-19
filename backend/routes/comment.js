const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// Add a comment to a post
router.post('/', async (req, res) => {
  const { post, user, content } = req.body;
  try {
    const comment = new Comment({ post, user, content });
    await comment.save();
    
    // Update user stats after creating comment
    try {
      await User.findByIdAndUpdate(user, { $inc: { totalComments: 1 } });
    } catch (statsError) {
      console.error('Error updating user stats:', statsError);
    }
    
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('user').sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.userId })
      .populate('user', 'username avatar walletAddress')
      .populate('post', 'title content')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching user comments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment by ID
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 