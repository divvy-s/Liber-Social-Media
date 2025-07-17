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

module.exports = router; 