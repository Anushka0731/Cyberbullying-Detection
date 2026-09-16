const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' })); // Vite's default dev port
app.use(express.json());
app.use(mongoSanitize());

async function connectDB() {
  try {
    await mongoose.connect(process.env.ATLAS_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected (Atlas)');
  } catch (err) {
    console.log('Atlas connection failed, falling back to local MongoDB...');
    try {
      await mongoose.connect(process.env.LOCAL_URI);
      console.log('MongoDB connected (Local)');
    } catch (localErr) {
      console.log('Local MongoDB connection also failed:', localErr.message);
    }
  }
}
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Backend is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));