const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let polls = new Map();
let users = new Map(); // Track all connected users
let students = new Map(); // Track students specifically
let teachers = new Map(); // Track teachers specifically
let currentPoll = null;
let pollTimer = null;
let chatMessages = []; // Store chat messages
let pollHistory = []; // Store completed polls for history

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
  studentPerformance: new Map() // Track each student's performance
};

// Force reset session state on server start
console.log('🌊 intervue.io poll Server starting - resetting session state');
sessionActive = false;
sessionStartTime = null;
sessionEndTime = null;

// Also reset session analytics
sessionAnalytics = {
  totalPolls: 0,
  totalStudents: 0,
  totalCorrectAnswers: 0,
  totalIncorrectAnswers: 0,
  averageAccuracy: 0,
  studentPerformance: new Map()
};

// Analytics tracking
let responseTimes = new Map(); // Track response times for each student
let participationData = new Map(); // Track participation data
let pollStartTime = null; // Track when poll started

// Enhanced logging
const logEvent = (event, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🌊 ${event}:`, data);
};

// Socket.io connection handling
io.on('connection', (socket) => {
  logEvent('User connected', { socketId: socket.id });

  // Join room for real-time updates
  socket.on('join-room', (data) => {
    socket.join('polling-room');
    socket.userType = data.userType;
    socket.userName = data.userName;
    socket.userId = uuidv4();
    
    // Store user information
    const userInfo = {
      id: socket.userId,
      socketId: socket.id,
      name: data.userName,
      userType: data.userType,
      connectedAt: Date.now()
    };
    
    users.set(socket.id, userInfo);
    
    if (data.userType === 'student') {
      students.set(socket.id, {
        ...userInfo,
        hasAnswered: false
      });
    } else if (data.userType === 'teacher') {
      teachers.set(socket.id, userInfo);
    }
    
    logEvent('User joined room', { 
      userName: data.userName, 
      userType: data.userType,
      totalUsers: users.size 
    });
    
    // Send current state to new user
    if (currentPoll) {
      socket.emit('poll-update', {
        poll: currentPoll,
        results: getPollResults(),
        timeLeft: getTimeLeft()
      });
    }
    
    // Send current chat messages to new user
    if (chatMessages.length > 0) {
      socket.emit('chat-history', chatMessages);
    }
    
    // Send current session state to teachers
    if (data.userType === 'teacher') {
      // Force reset session state for new teacher connections
      if (sessionActive) {
        logEvent('Resetting session state for new teacher connection');
        sessionActive = false;
        sessionStartTime = null;
        sessionEndTime = null;
        sessionAnalytics = {
          totalPolls: 0,
          totalStudents: 0,
          totalCorrectAnswers: 0,
          totalIncorrectAnswers: 0,
          averageAccuracy: 0,
          studentPerformance: new Map()
        };
      }
      
      logEvent('Sending session state to teacher', {
        sessionActive,
        sessionStartTime,
        sessionAnalytics: sessionActive ? {
          totalPolls: sessionAnalytics.totalPolls,
          totalStudents: sessionAnalytics.totalStudents,
          totalCorrectAnswers: sessionAnalytics.totalCorrectAnswers,
          totalIncorrectAnswers: sessionAnalytics.totalIncorrectAnswers,
          averageAccuracy: sessionAnalytics.averageAccuracy
        } : null
      });
      socket.emit('session-state', {
        sessionActive,
        sessionStartTime,
        sessionAnalytics: sessionActive ? {
          totalPolls: sessionAnalytics.totalPolls,
          totalStudents: sessionAnalytics.totalStudents,
          totalCorrectAnswers: sessionAnalytics.totalCorrectAnswers,
          totalIncorrectAnswers: sessionAnalytics.totalIncorrectAnswers,
          averageAccuracy: sessionAnalytics.averageAccuracy
        } : null
      });
    }
    
    // Update connected users count and send user list
    updateUserList();
    
    // Notify others about new user
    socket.broadcast.to('polling-room').emit('user-joined', {
      user: userInfo,
      totalUsers: users.size,
      students: students.size,
      teachers: teachers.size
    });
  });

  // Teacher creates a new poll
  socket.on('create-poll', (pollData) => {
    if (socket.userType !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can create polls' });
      return;
    }

    if (currentPoll && currentPoll.isActive) {
      socket.emit('error', { message: 'Please wait for current poll to complete' });
      return;
    }

    const pollId = uuidv4();
    
    // Set default options for Yes/No polls
    let pollOptions = pollData.options || [];
    if (pollData.pollType === 'yes-no') {
      pollOptions = ['Yes', 'No'];
    }
    
    currentPoll = {
      id: pollId,
      question: pollData.question,
      pollType: pollData.pollType || 'multiple-choice',
      options: pollOptions,
      timeLimit: pollData.timeLimit || 60,
      isAnonymous: pollData.isAnonymous || false,
      ratingScale: pollData.ratingScale || null,
      textResponse: pollData.textResponse || null,
      correctAnswer: pollData.correctAnswer || null, // Add correct answer field
      createdAt: Date.now(),
      answers: new Map(),
      isActive: true,
      createdBy: socket.userName
    };

    logEvent('Poll created', {
      pollId,
      question: pollData.question,
      pollType: pollData.pollType,
      timeLimit: pollData.timeLimit,
      createdBy: socket.userName
    });

    // Reset student answers and analytics data
    students.forEach(student => {
      student.hasAnswered = false;
    });
    
    // Reset analytics tracking
    responseTimes.clear();
    participationData.clear();
    pollStartTime = Date.now();

    // Start timer
    startPollTimer();

    io.to('polling-room').emit('poll-created', currentPoll);
  });

  // Student submits answer
  socket.on('submit-answer', (answer) => {
    if (socket.userType !== 'student' || !currentPoll || !currentPoll.isActive) {
      socket.emit('error', { message: 'Invalid action' });
      return;
    }

    const student = students.get(socket.id);
    if (!student || student.hasAnswered) {
      socket.emit('error', { message: 'You have already answered this poll' });
      return;
    }

    const responseTime = Date.now() - pollStartTime;
    
    // Record answer
    currentPoll.answers.set(socket.id, {
      studentName: student.name,
      answer: answer,
      timestamp: Date.now(),
      responseTime: responseTime
    });

    logEvent('Student submitted answer', {
      studentName: student.name,
      answer: answer,
      responseTime,
      pollId: currentPoll.id
    });

    // Track analytics data
    responseTimes.set(socket.id, responseTime);
    participationData.set(socket.id, {
      studentName: student.name,
      hasAnswered: true,
      responseTime: responseTime,
      answer: answer,
      timestamp: Date.now()
    });

    // Check if answer is correct (moved outside session analytics block)
    let isCorrect = false;
    if (currentPoll.correctAnswer) {
      if (currentPoll.pollType === 'multiple-choice') {
        // For multiple choice, check if all selected options match correct answer
        const correctOptions = Array.isArray(currentPoll.correctAnswer) ? currentPoll.correctAnswer : [currentPoll.correctAnswer];
        const selectedOptions = Array.isArray(answer) ? answer : [answer];
        isCorrect = correctOptions.length === selectedOptions.length && 
                   correctOptions.every(option => selectedOptions.includes(option));
      } else if (currentPoll.pollType === 'single-choice') {
        // For single choice, direct comparison
        isCorrect = answer === currentPoll.correctAnswer;
      } else if (currentPoll.pollType === 'yes-no') {
        // For yes/no, direct comparison
        isCorrect = answer === currentPoll.correctAnswer;
      } else if (currentPoll.pollType === 'rating') {
        // For rating, check if within acceptable range (e.g., correct answer ± 1)
        const studentRating = parseInt(answer);
        const correctRating = parseInt(currentPoll.correctAnswer);
        isCorrect = Math.abs(studentRating - correctRating) <= 1;
      }
      // For text responses, we'll skip correctness checking for now
    }

    // Track student performance for session analytics
    if (sessionActive && sessionAnalytics.studentPerformance.has(student.name)) {
      const performance = sessionAnalytics.studentPerformance.get(student.name);
      performance.totalAnswers++;
      
      if (isCorrect) {
        performance.correctAnswers++;
        sessionAnalytics.totalCorrectAnswers++;
      } else {
        sessionAnalytics.totalIncorrectAnswers++;
      }
      
      performance.accuracy = Math.round((performance.correctAnswers / performance.totalAnswers) * 100);
    }

    student.hasAnswered = true;

    // Send individual feedback to the student
    if (currentPoll.correctAnswer) {
      socket.emit('answer-feedback', {
        isCorrect: isCorrect,
        selectedAnswer: answer,
        correctAnswer: currentPoll.correctAnswer,
        message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Keep trying!'
      });
    }

    // Get individual student answers for teachers
    const individualAnswers = getIndividualStudentAnswers();

    // Emit updated results
    io.to('polling-room').emit('poll-results', {
      poll: currentPoll,
      results: getPollResults(),
      timeLeft: getTimeLeft(),
      individualAnswers: individualAnswers
    });

    // Check if all students have answered
    if (isPollComplete()) {
      endPoll();
    }
  });

  // Teacher asks new question
  socket.on('ask-new-question', () => {
    if (socket.userType !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can ask new questions' });
      return;
    }

    if (currentPoll && currentPoll.isActive) {
      socket.emit('error', { message: 'Current poll is still active' });
      return;
    }

    currentPoll = null;
    logEvent('Poll reset by teacher', { teacherName: socket.userName });
    io.to('polling-room').emit('poll-reset');
  });

  // Teacher removes a student
  socket.on('remove-student', (userId) => {
    logEvent('Teacher attempting to remove student', { 
      teacherName: socket.userName, 
      studentId: userId 
    });
    
    if (socket.userType !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can remove students' });
      return;
    }

    // Find the student by user ID
    let studentToRemove = null;
    let studentSocketId = null;
    
    for (const [socketId, student] of students.entries()) {
      if (student.id === userId) {
        studentToRemove = student;
        studentSocketId = socketId;
        break;
      }
    }

    if (studentToRemove && studentSocketId) {
      students.delete(studentSocketId);
      users.delete(studentSocketId);
      
      // Notify the student they've been kicked
      const studentSocket = io.sockets.sockets.get(studentSocketId);
      if (studentSocket) {
        studentSocket.emit('kicked-out', {
          message: 'You have been removed from the session by the teacher.'
        });
        
        // Disconnect the student
        studentSocket.disconnect();
      }
      
      // Update user list
      updateUserList();
      
      io.to('polling-room').emit('student-removed', { 
        userId, 
        studentName: studentToRemove.name 
      });
      
      logEvent('Student removed', { 
        studentName: studentToRemove.name, 
        studentId: userId 
      });
    } else {
      socket.emit('error', { message: 'Student not found' });
    }
  });

  // Enhanced chat functionality
  socket.on('send-message', (message) => {
    const user = users.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    const chatMessage = {
      id: uuidv4(),
      sender: user.name,
      senderType: user.userType,
      message: message.text,
      timestamp: Date.now(),
      senderId: socket.id
    };

    logEvent('Chat message sent', {
      sender: user.name,
      senderType: user.userType,
      messageLength: message.text.length
    });

    // Store message
    chatMessages.push(chatMessage);
    
    // Keep only last 100 messages
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }

    // Broadcast to all users
    io.to('polling-room').emit('new-message', chatMessage);
  });

  // Get user list
  socket.on('get-users', () => {
    const userList = Array.from(users.values()).map(user => ({
      id: user.id,
      name: user.name,
      userType: user.userType,
      connectedAt: user.connectedAt
    }));
    socket.emit('user-list', userList);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    logEvent('User disconnected', { socketId: socket.id });
    
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      
      if (user.userType === 'student') {
        students.delete(socket.id);
      } else if (user.userType === 'teacher') {
        teachers.delete(socket.id);
      }
      
      // Notify others about user leaving
      socket.broadcast.to('polling-room').emit('user-left', {
        user: user,
        totalUsers: users.size,
        students: students.size,
        teachers: teachers.size
      });
      
      updateUserList();
    }
  });

  // Session management events
  socket.on('start-session', () => {
    logEvent('=== START SESSION REQUESTED ===');
    logEvent('Start session requested by', { teacherName: socket.userName });
    logEvent('Current sessionActive state', { sessionActive });
    
    if (socket.userType !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can start sessions' });
      return;
    }

    // Force reset session state if it's stuck
    if (sessionActive) {
      logEvent('=== FORCING SESSION RESET ===');
      sessionActive = false;
      sessionStartTime = null;
      sessionEndTime = null;
      sessionAnalytics = {
        totalPolls: 0,
        totalStudents: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        averageAccuracy: 0,
        studentPerformance: new Map()
      };
      logEvent('Session reset complete, sessionActive is now', { sessionActive });
    }

    sessionActive = true;
    sessionStartTime = Date.now();
    sessionAnalytics = {
      totalPolls: 0,
      totalStudents: students.size,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      averageAccuracy: 0,
      studentPerformance: new Map()
    };

    // Initialize student performance tracking
    students.forEach((student, socketId) => {
      sessionAnalytics.studentPerformance.set(student.name, {
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0
      });
    });

    logEvent('Session started', {
      sessionStartTime,
      totalStudents: students.size
    });

    io.to('polling-room').emit('session-started', {
      sessionStartTime,
      totalStudents: students.size
    });
  });

  socket.on('end-session', () => {
    if (socket.userType !== 'teacher') {
      socket.emit('error', { message: 'Only teachers can end sessions' });
      return;
    }

    if (!sessionActive) {
      socket.emit('error', { message: 'No active session' });
      return;
    }

    sessionActive = false;
    sessionEndTime = Date.now();

    // Calculate final session analytics
    const totalStudents = sessionAnalytics.studentPerformance.size;
    const totalAnswers = sessionAnalytics.totalCorrectAnswers + sessionAnalytics.totalIncorrectAnswers;
    sessionAnalytics.averageAccuracy = totalAnswers > 0 ? 
      Math.round((sessionAnalytics.totalCorrectAnswers / totalAnswers) * 100) : 0;

    const sessionData = {
      sessionEndTime,
      sessionDuration: sessionEndTime - sessionStartTime,
      sessionAnalytics: {
        ...sessionAnalytics,
        studentPerformance: Array.from(sessionAnalytics.studentPerformance.entries()).map(([name, data]) => ({
          studentName: name,
          ...data
        }))
      }
    };

    logEvent('Session ended', {
      sessionDuration: sessionData.sessionDuration,
      totalPolls: sessionAnalytics.totalPolls,
      totalStudents: sessionAnalytics.totalStudents,
      averageAccuracy: sessionAnalytics.averageAccuracy
    });

    io.to('polling-room').emit('session-ended', sessionData);
  });

  socket.on('get-student-performance', (studentName) => {
    if (socket.userType !== 'student') {
      socket.emit('error', { message: 'Only students can request their performance' });
      return;
    }

    const performance = sessionAnalytics.studentPerformance.get(studentName);
    if (performance) {
      socket.emit('student-performance', performance);
    } else {
      socket.emit('error', { message: 'Performance data not found' });
    }
  });
});

// Helper functions
function getPollResults() {
  if (!currentPoll) return null;

  const totalAnswers = currentPoll.answers.size;
  
  switch (currentPoll.pollType) {
    case 'multiple-choice':
      const multiResults = {};
      currentPoll.options.forEach(option => {
        multiResults[option] = 0;
      });

      let totalVotes = 0;
      currentPoll.answers.forEach(answer => {
        if (Array.isArray(answer.answer)) {
          // Multiple choice - count each selected option
          answer.answer.forEach(selectedOption => {
            if (multiResults[selectedOption] !== undefined) {
              multiResults[selectedOption]++;
              totalVotes++;
            }
          });
        } else {
          // Single selection in multiple choice - treat as array with one element
          if (multiResults[answer.answer] !== undefined) {
            multiResults[answer.answer]++;
            totalVotes++;
          }
        }
      });

      const multiPercentageResults = {};
      Object.keys(multiResults).forEach(option => {
        multiPercentageResults[option] = totalVotes > 0 ? Math.round((multiResults[option] / totalVotes) * 100) : 0;
      });

      return {
        counts: multiResults,
        percentages: multiPercentageResults,
        totalAnswers
      };

    case 'single-choice':
      const singleResults = {};
      currentPoll.options.forEach(option => {
        singleResults[option] = 0;
      });

      currentPoll.answers.forEach(answer => {
        if (singleResults[answer.answer] !== undefined) {
          // Single choice - count each person's selection
          singleResults[answer.answer]++;
        }
      });

      const singlePercentageResults = {};
      Object.keys(singleResults).forEach(option => {
        singlePercentageResults[option] = totalAnswers > 0 ? Math.round((singleResults[option] / totalAnswers) * 100) : 0;
      });

      return {
        counts: singleResults,
        percentages: singlePercentageResults,
        totalAnswers
      };

    case 'rating':
      const ratingResults = {};
      const maxRating = currentPoll.ratingScale || 5;
      
      for (let i = 1; i <= maxRating; i++) {
        ratingResults[i] = 0;
      }

      currentPoll.answers.forEach(answer => {
        const rating = parseInt(answer.answer);
        if (rating >= 1 && rating <= maxRating) {
          ratingResults[rating]++;
        }
      });

      const ratingPercentages = {};
      Object.keys(ratingResults).forEach(rating => {
        ratingPercentages[rating] = totalAnswers > 0 ? Math.round((ratingResults[rating] / totalAnswers) * 100) : 0;
      });

      const totalRating = Array.from(currentPoll.answers.values()).reduce((sum, answer) => sum + parseInt(answer.answer), 0);
      
      return {
        counts: ratingResults,
        percentages: ratingPercentages,
        totalAnswers,
        averageRating: totalAnswers > 0 ? Math.round((totalRating / totalAnswers) * 10) / 10 : 0
      };

    case 'yes-no':
      const yesNoResults = { 'Yes': 0, 'No': 0 };
      
      currentPoll.answers.forEach(answer => {
        const response = answer.answer;
        if (response === 'Yes') {
          yesNoResults['Yes']++;
        } else if (response === 'No') {
          yesNoResults['No']++;
        }
      });

      const yesNoPercentages = {};
      Object.keys(yesNoResults).forEach(option => {
        yesNoPercentages[option] = totalAnswers > 0 ? Math.round((yesNoResults[option] / totalAnswers) * 100) : 0;
      });

      return {
        counts: yesNoResults,
        percentages: yesNoPercentages,
        totalAnswers
      };

    case 'text':
      const textResponses = [];
      currentPoll.answers.forEach(answer => {
        textResponses.push({
          text: answer.answer,
          studentName: currentPoll.isAnonymous ? 'Anonymous' : answer.studentName,
          timestamp: answer.timestamp
        });
      });

      return {
        responses: textResponses,
        totalAnswers
      };

    case 'image':
      const imageResults = {};
      currentPoll.imageOptions.forEach(option => {
        imageResults[option.id] = 0;
      });

      currentPoll.answers.forEach(answer => {
        if (imageResults[answer.answer] !== undefined) {
          imageResults[answer.answer]++;
        }
      });

      const imagePercentages = {};
      Object.keys(imageResults).forEach(optionId => {
        imagePercentages[optionId] = totalAnswers > 0 ? Math.round((imageResults[optionId] / totalAnswers) * 100) : 0;
      });

      return {
        counts: imageResults,
        percentages: imagePercentages,
        totalAnswers
      };

    default:
      return {
        counts: {},
        percentages: {},
        totalAnswers: 0
      };
  }
}

function getTimeLeft() {
  if (!currentPoll || !currentPoll.isActive) return 0;
  
  const elapsed = Math.floor((Date.now() - currentPoll.createdAt) / 1000);
  const timeLeft = currentPoll.timeLimit - elapsed;
  return Math.max(0, timeLeft);
}

function isPollComplete() {
  if (!currentPoll) return false;
  
  const activeStudents = Array.from(students.values()).filter(student => !student.hasAnswered);
  return activeStudents.length === 0;
}

function startPollTimer() {
  if (pollTimer) clearTimeout(pollTimer);
  
  // Send timer updates every second
  const timerInterval = setInterval(() => {
    if (currentPoll && currentPoll.isActive) {
      const timeLeft = getTimeLeft();
      logEvent('Timer update', { timeLeft });
      io.to('polling-room').emit('timer-update', { timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endPoll();
      }
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
  
  // Set the main timeout for when the poll should end
  pollTimer = setTimeout(() => {
    if (currentPoll && currentPoll.isActive) {
      endPoll();
    }
  }, currentPoll.timeLimit * 1000);
}

function endPoll() {
  if (currentPoll) {
    currentPoll.isActive = false;
    const results = getPollResults();
    
    // Save to poll history
    const pollForHistory = {
      id: currentPoll.id,
      question: currentPoll.question,
      pollType: currentPoll.pollType,
      options: currentPoll.options,
      isAnonymous: currentPoll.isAnonymous,
      ratingScale: currentPoll.ratingScale,
      textResponse: currentPoll.textResponse,
      imageOptions: currentPoll.imageOptions,
      createdAt: currentPoll.createdAt,
      createdBy: currentPoll.createdBy,
      results: results,
      totalAnswers: results.totalAnswers
    };
    
    pollHistory.push(pollForHistory);
    logEvent('Poll added to history', { 
      question: currentPoll.question,
      totalAnswers: results.totalAnswers 
    });
    
    io.to('polling-room').emit('poll-ended', {
      poll: currentPoll,
      results: results
    });
    
    // Notify all users that poll history has been updated
    io.to('polling-room').emit('poll-history-updated', pollHistory);
  }
}

function updateUserList() {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    name: user.name,
    userType: user.userType,
    connectedAt: user.connectedAt
  }));
  
  io.to('polling-room').emit('user-list-updated', {
    users: userList,
    totalUsers: users.size,
    students: students.size,
    teachers: teachers.size
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    users: users.size,
    students: students.size,
    teachers: teachers.size,
    platform: 'intervue.io poll'
  });
});

app.get('/api/current-poll', (req, res) => {
  res.json({
    poll: currentPoll,
    results: currentPoll ? getPollResults() : null,
    timeLeft: currentPoll ? getTimeLeft() : 0
  });
});

app.get('/api/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    name: user.name,
    userType: user.userType,
    connectedAt: user.connectedAt
  }));
  res.json(userList);
});

app.get('/api/chat-messages', (req, res) => {
  res.json(chatMessages);
});

app.get('/api/poll-history', (req, res) => {
  res.json(pollHistory);
});

// Analytics endpoints
app.get('/api/analytics/current', (req, res) => {
  if (!currentPoll) {
    return res.json({ error: 'No active poll' });
  }
  
  const analytics = {
    pollId: currentPoll.id,
    question: currentPoll.question,
    totalStudents: students.size,
    answeredStudents: Array.from(participationData.values()).filter(p => p.hasAnswered).length,
    averageResponseTime: calculateAverageResponseTime(),
    responseTimeDistribution: calculateResponseTimeDistribution(),
    participationRate: calculateParticipationRate(),
    correctAnswers: calculateCorrectAnswers(),
    incorrectAnswers: calculateIncorrectAnswers(),
    accuracyRate: calculateAccuracyRate(),
    pollStartTime: pollStartTime,
    currentTime: Date.now()
  };
  
  res.json(analytics);
});

app.get('/api/analytics/participation', (req, res) => {
  const participation = Array.from(participationData.values()).map(data => ({
    studentName: data.studentName,
    hasAnswered: data.hasAnswered,
    responseTime: data.responseTime || null,
    answer: data.answer || null,
    isCorrect: data.hasAnswered, // For now, assume all answered are correct
    timestamp: data.timestamp
  }));
  
  res.json(participation);
});

// Helper functions for analytics
function calculateAverageResponseTime() {
  const times = Array.from(responseTimes.values());
  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

function calculateResponseTimeDistribution() {
  const times = Array.from(responseTimes.values());
  const distribution = {
    '0-10s': 0,
    '10-30s': 0,
    '30-60s': 0,
    '60s+': 0
  };
  
  times.forEach(time => {
    if (time <= 10000) distribution['0-10s']++;
    else if (time <= 30000) distribution['10-30s']++;
    else if (time <= 60000) distribution['30-60s']++;
    else distribution['60s+']++;
  });
  
  return distribution;
}

function calculateParticipationRate() {
  if (students.size === 0) return 0;
  const answered = Array.from(participationData.values()).filter(p => p.hasAnswered).length;
  return Math.round((answered / students.size) * 100);
}

function calculateCorrectAnswers() {
  // For now, we'll assume all answers are correct
  // In a real implementation, you'd compare against correct answers
  return Array.from(participationData.values()).filter(p => p.hasAnswered).length;
}

function calculateIncorrectAnswers() {
  // For now, we'll assume no incorrect answers
  // In a real implementation, you'd compare against correct answers
  return 0;
}

function calculateAccuracyRate() {
  const totalAnswered = Array.from(participationData.values()).filter(p => p.hasAnswered).length;
  if (totalAnswered === 0) return 0;
  
  const correct = calculateCorrectAnswers();
  return Math.round((correct / totalAnswered) * 100);
}

function getIndividualStudentAnswers() {
  if (!currentPoll) return [];
  
  const individualAnswers = [];
  
  currentPoll.answers.forEach((answer, socketId) => {
    const student = students.get(socketId);
    if (!student) return;
    
    // Check if answer is correct
    let isCorrect = false;
    if (currentPoll.correctAnswer) {
      if (currentPoll.pollType === 'multiple-choice') {
        // For multiple choice, check if all selected options match correct answer
        const correctOptions = Array.isArray(currentPoll.correctAnswer) ? currentPoll.correctAnswer : [currentPoll.correctAnswer];
        const selectedOptions = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
        isCorrect = correctOptions.length === selectedOptions.length && 
                   correctOptions.every(option => selectedOptions.includes(option));
      } else if (currentPoll.pollType === 'single-choice') {
        // For single choice, direct comparison
        isCorrect = answer.answer === currentPoll.correctAnswer;
      } else if (currentPoll.pollType === 'yes-no') {
        // For yes/no, direct comparison
        isCorrect = answer.answer === currentPoll.correctAnswer;
      } else if (currentPoll.pollType === 'rating') {
        // For rating, check if within acceptable range (e.g., correct answer ± 1)
        const studentRating = parseInt(answer.answer);
        const correctRating = parseInt(currentPoll.correctAnswer);
        isCorrect = Math.abs(studentRating - correctRating) <= 1;
      }
      // For text responses, we'll skip correctness checking for now
    }
    
    individualAnswers.push({
      studentName: student.name,
      answer: answer.answer,
      isCorrect: isCorrect,
      responseTime: answer.responseTime,
      timestamp: answer.timestamp
    });
  });
  
  return individualAnswers;
}

// Session management endpoints
app.post('/api/session/start', (req, res) => {
  if (sessionActive) {
    return res.status(400).json({ error: 'Session already active' });
  }
  
  sessionActive = true;
  sessionStartTime = Date.now();
  sessionAnalytics = {
    totalPolls: 0,
    totalStudents: students.size,
    totalCorrectAnswers: 0,
    totalIncorrectAnswers: 0,
    averageAccuracy: 0,
    studentPerformance: new Map()
  };
  
  // Initialize student performance tracking
  students.forEach((student, socketId) => {
    sessionAnalytics.studentPerformance.set(student.name, {
      totalAnswers: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0
    });
  });
  
  res.json({ 
    success: true, 
    sessionStartTime,
    totalStudents: students.size 
  });
});

app.post('/api/session/end', (req, res) => {
  if (!sessionActive) {
    return res.status(400).json({ error: 'No active session' });
  }
  
  sessionActive = false;
  sessionEndTime = Date.now();
  
  // Calculate final session analytics
  const totalStudents = sessionAnalytics.studentPerformance.size;
  const totalAnswers = sessionAnalytics.totalCorrectAnswers + sessionAnalytics.totalIncorrectAnswers;
  sessionAnalytics.averageAccuracy = totalAnswers > 0 ? 
    Math.round((sessionAnalytics.totalCorrectAnswers / totalAnswers) * 100) : 0;
  
  res.json({
    success: true,
    sessionEndTime,
    sessionAnalytics: {
      ...sessionAnalytics,
      sessionDuration: sessionEndTime - sessionStartTime,
      studentPerformance: Array.from(sessionAnalytics.studentPerformance.entries()).map(([name, data]) => ({
        studentName: name,
        ...data
      }))
    }
  });
});

app.get('/api/session/analytics', (req, res) => {
  if (sessionActive) {
    return res.status(400).json({ error: 'Session is still active' });
  }
  
  res.json({
    sessionStartTime,
    sessionEndTime,
    sessionDuration: sessionEndTime - sessionStartTime,
    sessionAnalytics
  });
});

app.get('/api/student/performance/:studentName', (req, res) => {
  const { studentName } = req.params;
  const performance = sessionAnalytics.studentPerformance.get(studentName);
  
  if (!performance) {
    return res.status(404).json({ error: 'Student performance not found' });
  }
  
  res.json(performance);
});

// Reset session endpoint for debugging
app.post('/api/session/reset', (req, res) => {
  logEvent('Resetting session state via API');
  sessionActive = false;
  sessionStartTime = null;
  sessionEndTime = null;
  sessionAnalytics = {
    totalPolls: 0,
    totalStudents: 0,
    totalCorrectAnswers: 0,
    totalIncorrectAnswers: 0,
    averageAccuracy: 0,
    studentPerformance: new Map()
  };
  res.json({ success: true, message: 'Session reset' });
});

// Get current session state
app.get('/api/session/state', (req, res) => {
  res.json({
    sessionActive,
    sessionStartTime,
    sessionEndTime,
    sessionAnalytics: sessionActive ? {
      totalPolls: sessionAnalytics.totalPolls,
      totalStudents: sessionAnalytics.totalStudents,
      totalCorrectAnswers: sessionAnalytics.totalCorrectAnswers,
      totalIncorrectAnswers: sessionAnalytics.totalIncorrectAnswers,
      averageAccuracy: sessionAnalytics.averageAccuracy
    } : null
  });
});

// Debug endpoint to check session state
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionActive,
    sessionStartTime,
    sessionEndTime,
    message: `Session is ${sessionActive ? 'ACTIVE' : 'INACTIVE'}`
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log('🌊 intervue.io poll Server started successfully!');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Platform: intervue.io poll Interactive Learning Platform`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('Initial session state:', { sessionActive, sessionStartTime, sessionEndTime });
}); 