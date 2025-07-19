const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 