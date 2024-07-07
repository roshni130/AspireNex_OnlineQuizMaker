const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/onlineQuizDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

const MCQSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
});

const MCQ = mongoose.model('MCQ', MCQSchema);


app.use(cors());
app.use(express.json());



app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.status(201).json({ success: true });
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ success: true, token });
});


const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
};


app.post('/api/mcq', authenticateJWT, async (req, res) => {
  const { question, options, correctAnswer } = req.body;

  if (!question || !options || !correctAnswer) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const mcq = new MCQ({
    question,
    options,
    correctAnswer,
  });

  await mcq.save();
  res.status(201).json({ success: true, message: 'MCQ created successfully' });
});


app.get('/api/mcq', authenticateJWT, async (req, res) => {
  const mcqs = await MCQ.find();
  res.status(200).json(mcqs);
});


app.delete('/api/mcq/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMcq = await MCQ.findByIdAndDelete(id);
    if (!deletedMcq) {
      return res.status(404).json({ success: false, message: 'MCQ not found' });
    }
    res.status(200).json({ success: true, message: 'MCQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.post('/api/submit-quiz', authenticateJWT, async (req, res) => {
  const { answers } = req.body;

  // Validate the answers object
  if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  let score = 0;

  for (const [key, value] of Object.entries(answers)) {
      // Extract question index from the key (e.g., "question0")
      const questionIndex = parseInt(key.replace('question', ''), 10);
      const mcq = await MCQ.findOne().skip(questionIndex).exec(); // Assuming MCQs are stored in order

      if (mcq && mcq.correctAnswer === value) {
          score += 10; // Each correct answer scores 10 points
      }
  }

  return res.status(200).json({ success: true, score });
});



const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


