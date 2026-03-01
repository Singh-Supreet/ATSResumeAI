const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/aiService');

// Extract text from uploaded file
const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  return '';
};

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  const targetRole    = (req.body.targetRole    || '').trim();
  const jobDescription = (req.body.jobDescription || '').trim();

  // Create resume record immediately
  const resume = await Resume.create({
    user: req.user._id,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    targetRole,
    jobDescription,
    status: 'processing',
  });

  // Process in background (respond immediately)
  res.status(202).json({
    success: true,
    message: 'Resume uploaded. Analysis in progress...',
    resumeId: resume._id,
  });

  // Background processing
  try {
    const extractedText = await extractText(filePath, req.file.mimetype);

    if (!extractedText || extractedText.trim().length < 50) {
      await Resume.findByIdAndUpdate(resume._id, { status: 'failed' });
      return;
    }

    const analysis = await analyzeResume(extractedText, resume.targetRole, resume.jobDescription);

    await Resume.findByIdAndUpdate(resume._id, {
      extractedText,
      analysis: {
        atsScore: analysis.atsScore || 0,
        overallScore: analysis.overallScore || 0,
        experienceLevel: analysis.experienceLevel || 'Unknown',
        jobTitles: analysis.jobTitles || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || [],
        missingKeywords: analysis.missingKeywords || [],
        technicalSkills: analysis.technicalSkills || [],
        softSkills: analysis.softSkills || [],
        formattingIssues: analysis.formattingIssues || [],
        summary: analysis.summary || '',
      },
      status: 'completed',
    });

    // Clean up file after processing
    fs.unlink(filePath, () => {});
  } catch (error) {
    console.error('\n❌ Analysis error:', error.message, '\n');

    // Surface the API key issue in the record for debugging
    const failReason = error.message.includes('API_KEY_NO_FREE_TIER')
      ? 'api_key_no_free_tier'
      : error.message.includes('429') || error.message.includes('quota')
      ? 'rate_limited'
      : error.message.includes('JSON')
      ? 'ai_response_parse_error'
      : 'unknown';

    console.error(`   Fail reason: ${failReason}`);
    await Resume.findByIdAndUpdate(resume._id, { status: 'failed' });
    fs.unlink(filePath, () => {});
  }
};

// @desc    Get analysis status and result
// @route   GET /api/resume/:id
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's resume history
// @route   GET /api/resume/history
const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume, getResume, getHistory, deleteResume };
