/**
 * Kai Notes - Classroom Mode Backend Server
 * Express server with in-memory storage for classroom management
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow requests from Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://kai-notes-lg10y2akf-kavin-vikramans-projects.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true
}));
app.use(express.json());

// ============================================
// IN-MEMORY STORAGE
// ============================================

/**
 * Classroom data structure:
 * {
 *   "AB12CD": {
 *     name: "CS Department",
 *     students: [
 *       { name: "Kavin", score: 0 }
 *     ]
 *   }
 * }
 */
const classrooms = {};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a random 6-character uppercase alphanumeric code
 * @returns {string} Unique classroom code
 */
function generateClassroomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Ensure code is unique
  if (classrooms[code]) {
    return generateClassroomCode();
  }
  return code;
}

// ============================================
// API ROUTES
// ============================================

/**
 * POST /create-classroom
 * Create a new classroom with a unique code
 * Body: { className: "CS Department" }
 * Response: { code: "AB12CD", name: "CS Department" }
 */
app.post('/create-classroom', (req, res) => {
  try {
    const { className } = req.body;

    // Validate input
    if (!className || className.trim() === '') {
      return res.status(400).json({ error: 'Classroom name is required' });
    }

    // Generate unique code
    const code = generateClassroomCode();

    // Create classroom
    classrooms[code] = {
      name: className.trim(),
      students: [],
      createdAt: new Date().toISOString()
    };

    console.log(`✅ Classroom created: ${code} - ${className}`);

    res.status(201).json({
      code,
      name: classrooms[code].name
    });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

/**
 * POST /join-classroom
 * Student joins a classroom using the code
 * Body: { code: "AB12CD", studentName: "Kavin" }
 * Response: { success: true, classroom: "CS Department" }
 */
app.post('/join-classroom', (req, res) => {
  try {
    const { code, studentName } = req.body;

    // Validate input
    if (!code || code.trim() === '') {
      return res.status(400).json({ error: 'Classroom code is required' });
    }
    if (!studentName || studentName.trim() === '') {
      return res.status(400).json({ error: 'Student name is required' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = studentName.trim();

    // Check if classroom exists
    if (!classrooms[normalizedCode]) {
      return res.status(404).json({ error: 'Classroom not found. Please check the code.' });
    }

    // Check if student already joined
    const existingStudent = classrooms[normalizedCode].students.find(
      s => s.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingStudent) {
      // Student already exists, return success (allow rejoining)
      return res.json({
        success: true,
        classroom: classrooms[normalizedCode].name,
        message: 'Welcome back!'
      });
    }

    // Add student to classroom
    classrooms[normalizedCode].students.push({
      name: normalizedName,
      score: 0,
      joinedAt: new Date().toISOString()
    });

    console.log(`✅ Student joined: ${normalizedName} -> ${normalizedCode}`);

    res.json({
      success: true,
      classroom: classrooms[normalizedCode].name,
      message: 'Successfully joined classroom!'
    });
  } catch (error) {
    console.error('Error joining classroom:', error);
    res.status(500).json({ error: 'Failed to join classroom' });
  }
});

/**
 * POST /submit-quiz
 * Submit quiz score for a student
 * Body: { code: "AB12CD", studentName: "Kavin", score: 8 }
 * Response: { success: true, rank: 1 }
 */
app.post('/submit-quiz', (req, res) => {
  try {
    const { code, studentName, score } = req.body;

    // Validate input
    if (!code || code.trim() === '') {
      return res.status(400).json({ error: 'Classroom code is required' });
    }
    if (!studentName || studentName.trim() === '') {
      return res.status(400).json({ error: 'Student name is required' });
    }
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Valid score is required' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = studentName.trim();

    // Check if classroom exists
    if (!classrooms[normalizedCode]) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Find student
    const student = classrooms[normalizedCode].students.find(
      s => s.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found in this classroom. Please join first.' });
    }

    // Update score (keep highest score)
    student.score = Math.max(student.score, score);
    student.lastAttempt = new Date().toISOString();

    // Calculate rank
    const sortedStudents = [...classrooms[normalizedCode].students].sort((a, b) => b.score - a.score);
    const rank = sortedStudents.findIndex(s => s.name === student.name) + 1;

    console.log(`✅ Quiz submitted: ${normalizedName} scored ${score} (Rank: ${rank})`);

    res.json({
      success: true,
      score: student.score,
      rank,
      totalStudents: sortedStudents.length
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

/**
 * GET /leaderboard/:code
 * Get leaderboard for a classroom
 * Response: [{ name: "Kavin", score: 8 }, ...]
 */
app.get('/leaderboard/:code', (req, res) => {
  try {
    const normalizedCode = req.params.code.trim().toUpperCase();

    // Check if classroom exists
    if (!classrooms[normalizedCode]) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Sort students by score (highest first)
    const leaderboard = classrooms[normalizedCode].students
      .map(s => ({ name: s.name, score: s.score }))
      .sort((a, b) => b.score - a.score);

    res.json({
      classroom: classrooms[normalizedCode].name,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /classroom/:code
 * Get classroom details
 */
app.get('/classroom/:code', (req, res) => {
  try {
    const normalizedCode = req.params.code.trim().toUpperCase();

    if (!classrooms[normalizedCode]) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json({
      code: normalizedCode,
      name: classrooms[normalizedCode].name,
      studentCount: classrooms[normalizedCode].students.length
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Failed to fetch classroom' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║     🎓 Kai Notes Classroom Server Running       ║
║     http://localhost:${PORT}                        ║
╚══════════════════════════════════════════════════╝
  `);
});
