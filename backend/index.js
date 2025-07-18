const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/user'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ipfs', require('./routes/ipfs'));
app.use('/api/nft', require('./routes/nft'));
app.use('/api/message', require('./routes/message'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/explore', require('./routes/explore'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Helper to emit notifications
app.emitNotification = (userId, notification) => {
  io.to(userId).emit('notification', notification);
};

// Helper to emit feed events
app.emitFeedEvent = (event, data, userIds = null) => {
  if (userIds && Array.isArray(userIds)) {
    userIds.forEach((id) => io.to(id).emit(event, data));
  } else {
    io.emit(event, data); // broadcast to all
  }
};

// Socket.IO real-time messaging
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST']
  }
});

// Presence tracking
const onlineUsers = new Set();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room for user (by userId)
  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.add(userId);
    io.emit('userOnline', userId);
  });

  // Send a message event
  socket.on('sendMessage', (data) => {
    // data: { sender, recipient, content, ... }
    // Emit to recipient's room
    io.to(data.recipient).emit('receiveMessage', data);
  });

  // Listen for manual notification test (for dev)
  socket.on('testNotification', (data) => {
    // data: { userId, notification }
    io.to(data.userId).emit('notification', data.notification);
  });

  // Typing indicators
  socket.on('typing', ({ recipient, sender }) => {
    io.to(recipient).emit('typing', { sender });
  });
  socket.on('stopTyping', ({ recipient, sender }) => {
    io.to(recipient).emit('stopTyping', { sender });
  });

  // Live reactions
  socket.on('react', ({ postId, userId, reaction }) => {
    io.emit('reaction', { postId, userId, reaction });
  });

  socket.on('disconnect', () => {
    // Find all userIds this socket was joined to (if you want to support multi-device, track mapping)
    // For simplicity, assume one userId per socket
    for (const userId of onlineUsers) {
      if (Array.from(io.sockets.adapter.rooms.get(userId) || []).length === 0) {
        onlineUsers.delete(userId);
        io.emit('userOffline', userId);
      }
    }
    console.log('A user disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Liber Social Media Backend is running!');
});

// Endpoint to get all online users
app.get('/api/online-users', (req, res) => {
  res.json(Array.from(onlineUsers));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 