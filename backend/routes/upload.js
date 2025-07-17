const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload - upload an image to Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ url: result.secure_url });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 