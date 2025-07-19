const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http'); // Add this line
const { Server } = require('socket.io'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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

app.get('/', (req, res) => {
  res.send('Liber Social Media Backend is running!');
});

// --- Socket.IO setup ---
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// In-memory map to track connected users: { account: socket.id }
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for user identification (client should emit after connecting)
  socket.on('identify', (account) => {
    if (account) {
      onlineUsers[account] = socket.id;
      console.log(`User ${account} is online as ${socket.id}`);
    }
  });

  // Listen for send_message from client
  socket.on('send_message', (msg) => {
    // msg should contain recipient (address or id) and message data
    const recipient = msg.recipient;
    if (recipient && onlineUsers[recipient]) {
      // Send to recipient only if online
      io.to(onlineUsers[recipient]).emit('receive_message', msg);
    }
    // Optionally, emit to sender as well (for confirmation)
    socket.emit('receive_message', msg);
  });

  socket.on('disconnect', () => {
    // Remove user from onlineUsers
    for (const [account, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        delete onlineUsers[account];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 