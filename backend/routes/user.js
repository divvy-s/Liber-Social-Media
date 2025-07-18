const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or update user
router.post('/', async (req, res) => {
  const { walletAddress, username, bio, avatar } = req.body;
  try {
    let user = await User.findOneAndUpdate(
      { walletAddress },
      { username, bio, avatar },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by MongoDB ID
router.get('/id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile by wallet address
router.put('/:walletAddress', async (req, res) => {
  const { username, bio, avatar, banner } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: req.params.walletAddress },
      { username, bio, avatar, banner },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow a user
router.post('/:id/follow', async (req, res) => {
  const { followerId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const follower = await User.findById(followerId);
    if (!user || !follower) return res.status(404).json({ error: 'User not found' });
    if (!user.followers.includes(followerId)) {
      user.followers.push(followerId);
      await user.save();
    }
    if (!follower.following.includes(user._id)) {
      follower.following.push(user._id);
      await follower.save();
    }
    res.json({ user, follower });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
router.post('/:id/unfollow', async (req, res) => {
  const { followerId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const follower = await User.findById(followerId);
    if (!user || !follower) return res.status(404).json({ error: 'User not found' });
    user.followers = user.followers.filter(id => id.toString() !== followerId);
    await user.save();
    follower.following = follower.following.filter(id => id.toString() !== user._id.toString());
    await follower.save();
    res.json({ user, follower });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get followers list
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get following list
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search users by username
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.params.query, $options: 'i' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 