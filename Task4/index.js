require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { resolve } = require('path');

const Job = require('./models/Job');
const Application = require('./models/Application');

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

// API Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

app.post('/api/apply', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: 'Error submitting application' });
  }
});

app.get('/api/seed-jobs', async (req, res) => {
  try {
    // Check if jobs already exist
    const jobCount = await Job.countDocuments();

    if (jobCount === 0) {
      // Sample job data
      const sampleJobs = [
        {
          title: "Full Stack Developer",
          company: "Tech Solutions Inc.",
          location: "Islamabad, Pakistan",
          description: "We are looking for a skilled Full Stack Developer with experience in MERN stack.",
          requirements: ["3+ years experience", "React", "Node.js", "MongoDB"],
          salary: "PKR 150,000 - 200,000",
          type: "Full-time"
        },
        {
          title: "Frontend Developer",
          company: "Digital Creations",
          location: "Lahore, Pakistan",
          description: "Join our team to build beautiful and responsive user interfaces.",
          requirements: ["JavaScript", "React", "CSS", "HTML"],
          salary: "PKR 100,000 - 130,000",
          type: "Full-time"
        },
        {
          title: "Backend Engineer",
          company: "Server Solutions",
          location: "Karachi, Pakistan",
          description: "Design and implement scalable backend systems for our growing platform.",
          requirements: ["Node.js", "Express", "MongoDB", "API Design"],
          salary: "PKR 120,000 - 160,000",
          type: "Full-time"
        },
        {
          title: "UI/UX Designer",
          company: "Creative Minds",
          location: "Islamabad, Pakistan",
          description: "Create compelling user experiences for web and mobile applications.",
          requirements: ["Figma", "Adobe XD", "User Research", "Prototyping"],
          salary: "PKR 90,000 - 120,000",
          type: "Full-time"
        }
      ];

      await Job.insertMany(sampleJobs);
      res.status(201).json({ message: "Sample jobs added successfully", count: sampleJobs.length });
    } else {
      res.status(200).json({ message: "Jobs already exist in database", count: jobCount });
    }
  } catch (error) {
    console.error("Error seeding jobs:", error);
    res.status(500).json({ error: "Failed to seed jobs" });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: 'Error creating job' });
  }
});

app.get('/api/applicants/:jobId', async (req, res) => {
  try {
    const applicants = await Application.find({ jobId: req.params.jobId });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching applicants' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});