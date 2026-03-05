const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');

const SECRET_KEY = '12345-67890-09876-54321';

exports.getToken = (user) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: 3600 });
};

exports.verifyUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded._id);
        if (!user) {
            const err = new Error('User not found!');
            err.status = 404;
            return next(err);
        }
        req.user = user;
        next();
    } catch (err) {
        const error = new Error('You are not authenticated!');
        error.status = 401;
        return next(error);
    }
};

exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.admin) {
        next();
    } else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        next(err);
    }
};

exports.verifyAuthor = async (req, res, next) => {
    try {
        const questionId = req.params.questionId;
        if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
            const err = new Error('Invalid Question ID format');
            err.status = 400;
            return next(err);
        }
        const question = await Question.findById(questionId);

        if (!question) {
            const err = new Error('Question not found');
            err.status = 404;
            return next(err);
        }

        if (question.author && question.author.equals(req.user._id)) {
            next();
        } else {
            const err = new Error('You are not the author of this question');
            err.status = 403;
            next(err);
        }
    } catch (err) {
        next(err);
    }
};


exports.verifyQuizAuthor = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        if (quiz.author && quiz.author.equals(req.user._id)) {
            next();
        } else {
            const err = new Error('You are not the author of this quiz');
            err.status = 403;
            next(err);
        }
    } catch (err) {
        next(err);
    }
};