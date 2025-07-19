const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'website', 'twitter', etc.
  url: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  bio: { type: String, default: "Web3 developer and blockchain enthusiast. Building the decentralized future one block at a time." },
  avatar: { type: String, default: "/placeholder.svg?height=150&width=150" },
  banner: { type: String, default: "/placeholder.svg?height=300&width=1200" },
  tokenId: { type: String, default: "42" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  links: [linkSchema],
  // Social stats
  totalPosts: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalUpvotes: { type: Number, default: 0 },
  totalDownvotes: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  // NFT related
  nftTokenId: { type: String },
  isNFTMinted: { type: Boolean, default: false },
  // Additional profile fields
  displayName: { type: String },
  location: { type: String },
  website: { type: String },
  twitter: { type: String },
  github: { type: String },
  discord: { type: String },
  telegram: { type: String },
  // Privacy settings
  isPrivate: { type: Boolean, default: false },
  showEmail: { type: Boolean, default: false },
  email: { type: String },
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  // Last activity
  lastActive: { type: Date, default: Date.now },
  // Profile completion
  profileCompletion: { type: Number, default: 0 }, // 0-100 percentage
}, { timestamps: true });

// Virtual for follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const fields = ['username', 'bio', 'avatar', 'banner'];
  
  fields.forEach(field => {
    if (this[field] && this[field] !== '' && !this[field].includes('placeholder')) {
      completion += 25;
    }
  });
  
  return Math.min(100, completion);
};

// Pre-save middleware to update profile completion
userSchema.pre('save', function(next) {
  this.profileCompletion = this.calculateProfileCompletion();
  this.lastActive = new Date();
  next();
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 