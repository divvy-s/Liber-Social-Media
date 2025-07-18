const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Mint a post as NFT (simulate minting, store tokenId)
router.post('/mint/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    // Simulate minting: generate a fake tokenId (in real use, call smart contract)
    const tokenId = 'NFT-' + post._id;
    post.nftTokenId = tokenId;
    await post.save();
    res.json({ message: 'NFT minted', tokenId, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all NFTs (posts with nftTokenId) for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId, nftTokenId: { $exists: true, $ne: '' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get NFT metadata for a post
router.get('/metadata/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('user');
    if (!post || !post.nftTokenId) return res.status(404).json({ error: 'NFT not found' });
    // Example metadata structure
    const metadata = {
      name: `Liber Post #${post._id}`,
      description: post.content,
      image: post.image,
      creator: post.user.username,
      ipfsHash: post.ipfsHash,
      nftTokenId: post.nftTokenId,
      createdAt: post.createdAt,
    };
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 