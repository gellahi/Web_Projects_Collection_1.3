const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('static'));

// MongoDB Connection with proper connection handling
let isConnected = false;

const connectWithRetry = async () => {
  try {
    if (!isConnected) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
        socketTimeoutMS: 45000, // Increase socket timeout
      });
      isConnected = true;
      console.log('Connected to MongoDB successfully');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnected = false;
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection
connectWithRetry();

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isConnected = false;
  connectWithRetry();
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
  connectWithRetry();
});

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({ error: 'Database connection not available' });
  }
  next();
};

// API Routes
app.get('/api/students/check-email/:email', checkDbConnection, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const student = await Student.findOne({ email: email });
    res.json({ exists: !!student });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error checking email' });
  }
});

app.post('/api/students/register', checkDbConnection, async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create and save new student
    const student = new Student({
      name,
      email,
      password,
      department
    });

    await student.save();
    
    console.log('Student registered successfully:', email);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});