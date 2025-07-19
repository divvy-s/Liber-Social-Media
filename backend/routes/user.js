const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Create or update user with comprehensive profile data
router.post('/', async (req, res) => {
  const { 
    walletAddress, 
    username, 
    bio, 
    avatar, 
    banner, 
    tokenId,
    links,
    displayName,
    location,
    website,
    twitter,
    github,
    discord,
    telegram,
    email,
    isPrivate,
    showEmail
  } = req.body;
  
  try {
    // Prepare update data
    const updateData = {
      username,
      bio,
      avatar,
      banner,
      tokenId,
      links: links || [],
      displayName,
      location,
      website,
      twitter,
      github,
      discord,
      telegram,
      email,
      isPrivate,
      showEmail
    };

    let user = await User.findOneAndUpdate(
      { walletAddress },
      updateData,
      { new: true, upsert: true }
    );

    // Calculate and update social stats
    await updateUserStats(user._id);
    
    // Return updated user with fresh stats
    user = await User.findById(user._id);
    res.json(user);
  } catch (err) {
    console.error('Error creating/updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by wallet address with comprehensive data
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress })
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate and update social stats
    await updateUserStats(user._id);
    
    // Return fresh user data with updated stats
    const updatedUser = await User.findById(user._id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by MongoDB ID with comprehensive data
router.get('/id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate and update social stats
    await updateUserStats(user._id);
    
    // Return fresh user data with updated stats
    const updatedUser = await User.findById(req.params.id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile by wallet address
router.put('/:walletAddress', async (req, res) => {
  const { 
    username, 
    bio, 
    avatar, 
    banner, 
    tokenId,
    links,
    displayName,
    location,
    website,
    twitter,
    github,
    discord,
    telegram,
    email,
    isPrivate,
    showEmail
  } = req.body;
  
  try {
    const updateData = {
      username,
      bio,
      avatar,
      banner,
      tokenId,
      links: links || [],
      displayName,
      location,
      website,
      twitter,
      github,
      discord,
      telegram,
      email,
      isPrivate,
      showEmail
    };

    const user = await User.findOneAndUpdate(
      { walletAddress: req.params.walletAddress },
      updateData,
      { new: true }
    );
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate and update social stats
    await updateUserStats(user._id);
    
    // Return updated user with fresh stats
    const updatedUser = await User.findById(user._id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
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
    
    // Return updated users with populated data
    const updatedUser = await User.findById(req.params.id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    const updatedFollower = await User.findById(followerId)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    res.json({ user: updatedUser, follower: updatedFollower });
  } catch (err) {
    console.error('Error following user:', err);
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
    
    // Return updated users with populated data
    const updatedUser = await User.findById(req.params.id)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    const updatedFollower = await User.findById(followerId)
      .populate('followers', 'username avatar walletAddress')
      .populate('following', 'username avatar walletAddress');
    
    res.json({ user: updatedUser, follower: updatedFollower });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get followers list
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username avatar walletAddress bio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get following list
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username avatar walletAddress bio');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.following);
  } catch (err) {
    console.error('Error fetching following:', err);
    res.status(500).json({ error: err.message });
  }
});

// Search users by username
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({ 
      username: { $regex: req.params.query, $options: 'i' } 
    }).select('username avatar bio walletAddress followerCount followingCount');
    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user stats (posts, comments, etc.)
router.get('/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get post count
    const postCount = await Post.countDocuments({ user: userId });
    
    // Get comment count
    const commentCount = await Comment.countDocuments({ user: userId });
    
    // Get total upvotes, downvotes, shares from posts
    const postStats = await Post.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null, 
          totalUpvotes: { $sum: '$upvotes' }, 
          totalDownvotes: { $sum: '$downvotes' }, 
          totalShares: { $sum: '$shares' } 
        } 
      }
    ]);
    
    const stats = {
      totalPosts: postCount,
      totalComments: commentCount,
      totalUpvotes: postStats[0]?.totalUpvotes || 0,
      totalDownvotes: postStats[0]?.totalDownvotes || 0,
      totalShares: postStats[0]?.totalShares || 0,
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to update user stats
async function updateUserStats(userId) {
  try {
    // Get post count
    const postCount = await Post.countDocuments({ user: userId });
    
    // Get comment count
    const commentCount = await Comment.countDocuments({ user: userId });
    
    // Get total upvotes, downvotes, shares from posts
    const postStats = await Post.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: null, 
          totalUpvotes: { $sum: '$upvotes' }, 
          totalDownvotes: { $sum: '$downvotes' }, 
          totalShares: { $sum: '$shares' } 
        } 
      }
    ]);
    
    // Update user with calculated stats
    await User.findByIdAndUpdate(userId, {
      totalPosts: postCount,
      totalComments: commentCount,
      totalUpvotes: postStats[0]?.totalUpvotes || 0,
      totalDownvotes: postStats[0]?.totalDownvotes || 0,
      totalShares: postStats[0]?.totalShares || 0,
    });
  } catch (err) {
    console.error('Error updating user stats:', err);
  }
}

module.exports = router; 