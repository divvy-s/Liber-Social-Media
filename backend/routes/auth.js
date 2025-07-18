const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ethers } = require('ethers');

// Verify wallet signature and login/register user
router.post('/wallet', async (req, res) => {
  const { walletAddress, signature, message } = req.body;
  try {
    // Verify signature
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    // Register or login user
    let user = await User.findOneAndUpdate(
      { walletAddress },
      {},
      { new: true, upsert: true }
    );
    // (Optional) Set session/cookie here
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by wallet address (session simulation)
router.get('/me/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 