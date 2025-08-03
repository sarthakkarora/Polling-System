const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-app-name.vercel.app"] 
    : ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io configuration for Vercel
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// In-memory storage (in production, consider using a database)
let polls = new Map();
let users = new Map();
let students = new Map();
let teachers = new Map();
let currentPoll = null;
let pollTimer = null;
let chatMessages = [];
let pollHistory = [];

// Session management
let sessionActive = false;
let sessionStartTime = null;
let sessionEndTime = null;
let sessionAnalytics = {
  totalPolls: 0,
  totalStudents: 0,
  totalCorrectAnswers: 0,
  totalIncorrectAnswers: 0,
  averageAccuracy: 0,
  studentPerformance: new Map()
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API endpoints
app.get('/api/session-status', (req, res) => {
  res.json({
    sessionActive,
    sessionStartTime,
    sessionEndTime,
    currentPoll: currentPoll ? {
      id: currentPoll.id,
      question: currentPoll.question,
      options: currentPoll.options,
      timeLimit: currentPoll.timeLimit,
      isActive: currentPoll.isActive
    } : null,
    studentsCount: students.size,
    teachersCount: teachers.size
  });
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`🚀 intervue.io poll server running on port ${PORT}`);
  });
}
