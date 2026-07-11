import mongoose from 'mongoose';

const AnalysisHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  language: { type: String },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  explanation: { type: String },
  topic: { type: String },
  difficulty: { type: String },
  developerLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Pro', 'Unknown'], default: 'Unknown' },
  mistakes: { type: [String], default: [] },
  optimization: { type: String }
}, { timestamps: true });

export default mongoose.model('analysis_histories', AnalysisHistorySchema);
