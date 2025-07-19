const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

// Search users by username
router.get('/users/:query', async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.params.query, $options: 'i' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search posts by content
router.get('/posts/:query', async (req, res) => {
  try {
    const posts = await Post.find({ content: { $regex: req.params.query, $options: 'i' } }).populate('user');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search hashtags in posts (hashtags are words starting with #)
router.get('/hashtags/:query', async (req, res) => {
  try {
    const regex = new RegExp(`#${req.params.query}`, 'i');
    const posts = await Post.find({ content: { $regex: regex } }).populate('user');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending users (most followers)
router.get('/trending/users', async (req, res) => {
  try {
    const users = await User.find().sort({ 'followers.length': -1 }).limit(10);
    // Fallback: sort in JS if Mongo can't sort by array length
    users.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending hashtags (most used in posts)
router.get('/trending/hashtags', async (req, res) => {
  try {
    const posts = await Post.find({ content: /#\w+/ });
    const hashtagCounts = {};
    posts.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
      hashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });
    const trending = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 