const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: Number,
  mimeType: String,
  targetRole: {
    type: String,
    default: '',
    trim: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  extractedText: {
    type: String,
    default: '',
  },
  analysis: {
    atsScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    experienceLevel: { type: String, default: 'Unknown' },
    jobTitles: [String],
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    missingKeywords: [String],
    technicalSkills: [String],
    softSkills: [String],
    formattingIssues: [String],
    summary: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
