const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authenticate = require('../authenticate');

router.route('/')
  .get(questionController.getAllQuestions)
  .post(authenticate.verifyUser, questionController.createQuestion);

router.route('/:questionId')
  .get(questionController.getQuestion)
  .put(authenticate.verifyUser, authenticate.verifyAuthor, questionController.updateQuestion)
  .delete(authenticate.verifyUser, authenticate.verifyAuthor, questionController.deleteQuestion);

module.exports = router;
