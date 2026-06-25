import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  category: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('quiz_results', QuizResultSchema);
