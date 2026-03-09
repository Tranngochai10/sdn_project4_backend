const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

connectDB();

// CORS – allow React dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000','https://sdn-project4-frontend.vercel.app'],
  credentials: true
}));

app.use(express.json());

app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Quiz API',
    endpoints: {
      quizzes: '/quizzes',
      questions: '/questions',
      users: '/users'
    }
  });
});

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});