require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const contentRoutes = require('./routes/contentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // For image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/content', contentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
