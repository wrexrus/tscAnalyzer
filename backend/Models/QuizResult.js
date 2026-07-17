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

// Same reason as AnalysisHistory — index makes per-user queries O(log n) not O(n)
QuizResultSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('quiz_results', QuizResultSchema);
