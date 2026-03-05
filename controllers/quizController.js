
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('questions');

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, author: req.user._id });

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Cascade delete: Delete all questions associated with this quiz
    if (quiz.questions && quiz.questions.length > 0) {
      await Question.deleteMany({ _id: { $in: quiz.questions } });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz and associated questions deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getQuizWithCapitalQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      match: {
        $or: [
          { keywords: 'capital' },
          { text: /capital/i }
        ]
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createQuestionInQuiz = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, author: req.user._id });

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $push: { questions: question._id } },
      { new: true }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        quiz: quiz,
        newQuestion: question
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.createManyQuestionsInQuiz = async (req, res) => {
  try {
    const questionsWithAuthor = req.body.map(q => ({ ...q, author: req.user._id }));
    const questions = await Question.insertMany(questionsWithAuthor);

    const questionIds = questions.map(q => q._id);

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $push: { questions: { $each: questionIds } } },
      { new: true }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        quiz: quiz,
        newQuestions: questions
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addExistingQuestionsToQuiz = async (req, res) => {
  try {
    const { questionIds } = req.body;
    if (!questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questionIds'
      });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { $addToSet: { questions: { $each: questionIds } } },
      { new: true }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.removeQuestionFromQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $pull: { questions: questionId } },
      { new: true }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question removed from quiz',
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
