const express = require('express');
const router = express.Router();
const multer = require('multer');
const ipfs = require('../utils/ipfs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/ipfs - upload a file to IPFS
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { path } = await ipfs.add(req.file.buffer);
    res.json({ hash: path, url: `https://ipfs.io/ipfs/${path}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 