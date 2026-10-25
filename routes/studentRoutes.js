const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Student = require('../models/Student');

const router = express.Router();

// Local JSON fallback file in case MongoDB Atlas IP whitelist or firewall blocks connection
const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'students.json');

const readFallbackStudents = () => {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeFallbackStudents = (students) => {
  const dir = path.dirname(FALLBACK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(students, null, 2), 'utf-8');
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * Validate student input fields
 */
const validateStudentInput = ({ name, email, course, semester }) => {
  if (!name || name.trim().length < 2) {
    return 'Student name must be at least 2 characters long';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  if (!course || !course.trim()) {
    return 'Course is required';
  }
  const semNum = Number(semester);
  if (!semester || Number.isNaN(semNum) || semNum < 1 || semNum > 8) {
    return 'Semester must be between 1 and 8';
  }
  return null;
};

/**
 * @route   GET /api/students
 * @desc    Get all students (sorted by newest first)
 */
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    }

    const students = readFallbackStudents().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format',
        });
      }

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: student,
      });
    }

    const students = readFallbackStudents();
    const student = students.find((s) => s._id === id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student details',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/students
 * @desc    Create a new student
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, course, semester } = req.body;

    const validationError = validateStudentInput({ name, email, course, semester });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (isMongoConnected()) {
      const existingStudent = await Student.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email address already exists',
        });
      }

      const student = await Student.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        course: course.trim(),
        semester: Number(semester),
      });

      return res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: student,
      });
    }

    // Fallback storage when MongoDB Atlas is still connecting
    const students = readFallbackStudents();
    const normalizedEmail = email.toLowerCase().trim();
    if (students.some((s) => s.email === normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email address already exists',
      });
    }

    const now = new Date().toISOString();
    const newStudent = {
      _id: crypto.randomBytes(12).toString('hex'),
      name: name.trim(),
      email: normalizedEmail,
      course: course.trim(),
      semester: Number(semester),
      createdAt: now,
      updatedAt: now,
    };

    students.unshift(newStudent);
    writeFallbackStudents(students);

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email address already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student by ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course, semester } = req.body;

    const validationError = validateStudentInput({ name, email, course, semester });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format',
        });
      }

      if (email) {
        const duplicateEmail = await Student.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: id },
        });
        if (duplicateEmail) {
          return res.status(400).json({
            success: false,
            message: 'Another student is already registered with this email address',
          });
        }
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          course: course.trim(),
          semester: Number(semester),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent,
      });
    }

    // Fallback storage when MongoDB Atlas is still connecting
    const students = readFallbackStudents();
    const index = students.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (students.some((s) => s.email === normalizedEmail && s._id !== id)) {
      return res.status(400).json({
        success: false,
        message: 'Another student is already registered with this email address',
      });
    }

    students[index] = {
      ...students[index],
      name: name.trim(),
      email: normalizedEmail,
      course: course.trim(),
      semester: Number(semester),
      updatedAt: new Date().toISOString(),
    };

    writeFallbackStudents(students);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: students[index],
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Another student is already registered with this email address',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format',
        });
      }

      const deletedStudent = await Student.findByIdAndDelete(id);

      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
        data: deletedStudent,
      });
    }

    // Fallback storage when MongoDB Atlas is still connecting
    const students = readFallbackStudents();
    const index = students.findIndex((s) => s._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const [deletedStudent] = students.splice(index, 1);
    writeFallbackStudents(students);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
});

module.exports = router;
