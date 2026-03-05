const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../authenticate');

router.route('/')
  .get(quizController.getAllQuizzes)
  .post(authenticate.verifyUser, authenticate.verifyAdmin, quizController.createQuiz);

// router.route('/:quizId')
//   .get(quizController.getQuiz)
//   .put(authenticate.verifyUser, authenticate.verifyAdmin, quizController.updateQuiz)
//   .delete(authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuiz);
router.route('/:quizId')

  .get(quizController.getQuiz)

  .put(authenticate.verifyUser, authenticate.verifyQuizAuthor, quizController.updateQuiz)

  .delete(authenticate.verifyUser, authenticate.verifyQuizAuthor, quizController.deleteQuiz);

router.get('/:quizId/populate', quizController.getQuizWithCapitalQuestions);
router.post('/:quizId/question', authenticate.verifyUser, authenticate.verifyAdmin, quizController.createQuestionInQuiz);
router.post('/:quizId/questions', authenticate.verifyUser, authenticate.verifyAdmin, quizController.createManyQuestionsInQuiz);
router.post('/:quizId/questions/existing', authenticate.verifyUser, authenticate.verifyAdmin, quizController.addExistingQuestionsToQuiz);
router.delete('/:quizId/questions/:questionId', authenticate.verifyUser, authenticate.verifyAdmin, quizController.removeQuestionFromQuiz);

module.exports = router;
