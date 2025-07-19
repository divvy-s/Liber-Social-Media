const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Health check route
router.get('/health', async (req, res) => {
  try {
    console.log('Health check route hit');
    res.json({ status: 'ok', message: 'Post routes are working' });
  } catch (err) {
    console.error('Error in health check:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test route to verify basic functionality
router.get('/test', async (req, res) => {
  try {
    console.log('Test route hit');
    const posts = await Post.find().limit(5);
    console.log('Test posts found:', posts.length);
    res.json({ message: 'Test successful', count: posts.length });
  } catch (err) {
    console.error('Error in test route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Trending posts (most popular based on upvotes, shares, and recent activity)
router.get('/trending', async (req, res) => {
  try {
    console.log('Trending route hit');
    
    // Get posts with user population
    const posts = await Post.find().populate('user').sort({ createdAt: -1 }).limit(50);
    console.log('Found posts:', posts.length);
    
    // If no posts exist, return empty array
    if (!posts || posts.length === 0) {
      console.log('No posts found, returning empty array');
      return res.json([]);
    }
    
    try {
      // Get comment counts for all posts
      const postIds = posts.map(post => post._id);
      const commentCounts = await Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: '$post', count: { $sum: 1 } } }
      ]);
      
      // Create a map of post ID to comment count
      const commentCountMap = {};
      commentCounts.forEach(item => {
        commentCountMap[item._id.toString()] = item.count;
      });
      
      // Calculate trending scores
      const postsWithScore = posts.map(post => {
        const upvotes = post.upvotes || 0;
        const downvotes = post.downvotes || 0;
        const shares = post.shares || 0;
        const comments = commentCountMap[post._id.toString()] || 0;
        
        // Calculate time decay (posts from last 24 hours get bonus)
        const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0.1, 1 - (hoursSinceCreation / 24));
        
        // Trending score formula: (upvotes - downvotes + shares * 2 + comments) * time_decay
        const trendingScore = (upvotes - downvotes + shares * 2 + comments) * timeDecay;
        
        return {
          ...post.toObject(),
          commentCount: comments,
          trendingScore
        };
      });
      
      // Sort by trending score and return top 10
      postsWithScore.sort((a, b) => b.trendingScore - a.trendingScore);
      const trendingPosts = postsWithScore.slice(0, 10);
      
      console.log('Returning trending posts:', trendingPosts.length);
      res.json(trendingPosts);
    } catch (commentError) {
      console.error('Error getting comment counts, falling back to posts without comments:', commentError);
      
      // Fallback: return posts without comment counts
      const postsWithScore = posts.map(post => {
        const upvotes = post.upvotes || 0;
        const downvotes = post.downvotes || 0;
        const shares = post.shares || 0;
        const comments = 0; // Fallback to 0
        
        // Calculate time decay (posts from last 24 hours get bonus)
        const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0.1, 1 - (hoursSinceCreation / 24));
        
        // Trending score formula: (upvotes - downvotes + shares * 2 + comments) * time_decay
        const trendingScore = (upvotes - downvotes + shares * 2 + comments) * timeDecay;
        
        return {
          ...post.toObject(),
          commentCount: comments,
          trendingScore
        };
      });
      
      // Sort by trending score and return top 10
      postsWithScore.sort((a, b) => b.trendingScore - a.trendingScore);
      const trendingPosts = postsWithScore.slice(0, 10);
      
      console.log('Returning trending posts (fallback):', trendingPosts.length);
      res.json(trendingPosts);
    }
  } catch (err) {
    console.error('Error in trending posts route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a post
router.post('/', async (req, res) => {
  const { user, title, content, image, nftTokenId, ipfsHash } = req.body;
  try {
    const post = new Post({ user, title, content, image, nftTokenId, ipfsHash });
    await post.save();
    
    // Update user stats after creating post
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(user, { $inc: { totalPosts: 1 } });
    } catch (statsError) {
      console.error('Error updating user stats:', statsError);
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike a post
router.post('/:id/unlike', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes = post.likes.filter(id => id.toString() !== userId);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote a post
router.post('/:id/upvote', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasUpvoted = post.upvotedBy.includes(userObjectId);
    const hasDownvoted = post.downvotedBy.includes(userObjectId);
    
    if (hasUpvoted) {
      // Remove upvote
      post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== userId);
      post.upvotes = Math.max(0, post.upvotes - 1);
      
      // Update post author's total upvotes
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(post.user, { $inc: { totalUpvotes: -1 } });
      } catch (statsError) {
        console.error('Error updating author stats:', statsError);
      }
    } else {
      // Add upvote
      post.upvotedBy.push(userObjectId);
      post.upvotes += 1;
      
      // Update post author's total upvotes
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(post.user, { $inc: { totalUpvotes: 1 } });
      } catch (statsError) {
        console.error('Error updating author stats:', statsError);
      }
      
      // Remove downvote if exists
      if (hasDownvoted) {
        post.downvotedBy = post.downvotedBy.filter(id => id.toString() !== userId);
        post.downvotes = Math.max(0, post.downvotes - 1);
        
        // Update post author's total downvotes
        try {
          const User = require('../models/User');
          await User.findByIdAndUpdate(post.user, { $inc: { totalDownvotes: -1 } });
        } catch (statsError) {
          console.error('Error updating author stats:', statsError);
        }
      }
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downvote a post
router.post('/:id/downvote', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasDownvoted = post.downvotedBy.includes(userObjectId);
    const hasUpvoted = post.upvotedBy.includes(userObjectId);
    
    if (hasDownvoted) {
      // Remove downvote
      post.downvotedBy = post.downvotedBy.filter(id => id.toString() !== userId);
      post.downvotes = Math.max(0, post.downvotes - 1);
      
      // Update post author's total downvotes
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(post.user, { $inc: { totalDownvotes: -1 } });
      } catch (statsError) {
        console.error('Error updating author stats:', statsError);
      }
    } else {
      // Add downvote
      post.downvotedBy.push(userObjectId);
      post.downvotes += 1;
      
      // Update post author's total downvotes
      try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(post.user, { $inc: { totalDownvotes: 1 } });
      } catch (statsError) {
        console.error('Error updating author stats:', statsError);
      }
      
      // Remove upvote if exists
      if (hasUpvoted) {
        post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== userId);
        post.upvotes = Math.max(0, post.upvotes - 1);
        
        // Update post author's total upvotes
        try {
          const User = require('../models/User');
          await User.findByIdAndUpdate(post.user, { $inc: { totalUpvotes: -1 } });
        } catch (statsError) {
          console.error('Error updating author stats:', statsError);
        }
      }
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share a post
router.post('/:id/share', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    post.shares += 1;
    await post.save();
    
    // Update post author's total shares
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(post.user, { $inc: { totalShares: 1 } });
    } catch (statsError) {
      console.error('Error updating author stats:', statsError);
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Search posts by content
router.get('/search/:query', async (req, res) => {
  try {
    const posts = await Post.find({ content: { $regex: req.params.query, $options: 'i' } }).populate('user');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find().populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Post.countDocuments();
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 