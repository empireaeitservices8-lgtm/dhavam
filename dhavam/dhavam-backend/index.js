// index.js
// Entry point for the Dhavam Spices backend (TiDB-based)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const allRoutes = require('./routes/allRoutes');

const app = express();

// Make sure the uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded images. If a file is missing, send a placeholder instead.
app.use('/uploads', (req, res, next) => {
  const fileName = path.basename(decodeURIComponent(req.path));
  const filePath = path.join(uploadsDir, fileName);

  if (fs.existsSync(filePath)) return next();

  const placeholder = path.join(__dirname, 'public', 'placeholder.png');
  if (fs.existsSync(placeholder)) return res.sendFile(placeholder);

  return res.status(404).json({ message: 'Image not found' });
});
app.use('/uploads', express.static(uploadsDir));

// API routes (public and protected; auth is applied inside the route file)
app.use('/', allRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (also catches multer errors such as "Only image files are allowed!")
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 400).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});