require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { resolve } = require('path');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('static'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Don't send password in response
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    // Check if users already exist
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      return res.status(400).json({ message: 'Database already has users' });
    }

    // Create sample users
    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User'
      },
      {
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Regular User'
      },
      {
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10),
        name: 'Test User'
      }
    ];

    await User.insertMany(users);

    res.status(201).json({
      message: 'Seed data created successfully',
      credentials: [
        { email: 'admin@example.com', password: 'admin123' },
        { email: 'user@example.com', password: 'user123' },
        { email: 'test@example.com', password: 'test123' }
      ]
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error during seeding' });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper route to create a test user
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/seed', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/seed.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});