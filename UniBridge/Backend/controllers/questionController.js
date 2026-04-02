const Question = require('../models/Question');
const ExamTest = require('../models/ExamTest');

// @desc    Add question to an exam
// @route   POST /api/admin/questions
// @access  Private/Admin
exports.addQuestion = async (req, res) => {
  try {
    const { examId, text, options, correctAnswer, marks } = req.body;

    // Validate required fields
    if (!examId || !text || !options || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide examId, text, options, and correctAnswer'
      });
    }

    // Check if exam exists
    const exam = await ExamTest.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Create question
    const question = await Question.create({
      examId,
      text,
      options,
      correctAnswer,
      marks: marks || 1
    });

    // Update exam's total marks
    const allQuestions = await Question.find({ examId });
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await ExamTest.findByIdAndUpdate(examId, { totalMarks });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// @desc    Get all questions for a specific exam
// @route   GET /api/admin/questions/:examId
// @access  Private/Admin
exports.getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Check if exam exists
    const exam = await ExamTest.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Get all questions for the exam
    const questions = await Question.find({ examId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      examTitle: exam.title,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get all questions (optional table view)
// @route   GET /api/admin/questions
// @access  Private/Admin
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('examId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get question by ID
// @route   GET /api/admin/questions/single/:id
// @access  Private/Admin
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('examId', 'title');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
  try {
    const { text, options, correctAnswer, marks } = req.body;

    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update fields
    if (text) question.text = text;
    if (options) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (marks) question.marks = marks;

    question = await question.save();

    // Update exam's total marks
    const allQuestions = await Question.find({ examId: question.examId });
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await ExamTest.findByIdAndUpdate(question.examId, { totalMarks });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update exam's total marks
    const allQuestions = await Question.find({ examId: question.examId });
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await ExamTest.findByIdAndUpdate(question.examId, { totalMarks });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};
