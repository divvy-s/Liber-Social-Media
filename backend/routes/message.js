const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
router.post('/', async (req, res) => {
  const { sender, recipient, content } = req.body;
  try {
    const message = new Message({ sender, recipient, content });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages between two users
router.get('/conversation/:user1/:user2', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.user1, recipient: req.params.user2 },
        { sender: req.params.user2, recipient: req.params.user1 },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all conversations for a user (unique recipients)
router.get('/conversations/:userId', async (req, res) => {
  try {
    const sent = await Message.find({ sender: req.params.userId }).distinct('recipient');
    const received = await Message.find({ recipient: req.params.userId }).distinct('sender');
    const userIds = Array.from(new Set([...sent, ...received]));
    const users = await User.find({ _id: { $in: userIds } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a message as read
router.post('/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 