import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiSparkles, HiCloudArrowUp, HiDocumentText, HiTrash, HiEye,
  HiCheckCircle, HiExclamationCircle, HiClock, HiChartBar,
  HiBriefcase, HiKey, HiChevronDown, HiChevronUp, HiClipboardDocument
} from 'react-icons/hi2';
import { FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/common/Loader';
import './Dashboard.scss';

const STATUS = { processing: 'processing', completed: 'completed', failed: 'failed' };

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work';
  return (
    <span className="score-badge" style={{ '--color': color }}>
      {score} · {label}
    </span>
  );
};

const ROLE_SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Product Manager', 'UI/UX Designer', 'DevOps Engineer',
  'Machine Learning Engineer', 'Data Analyst', 'Cloud Architect', 'Cybersecurity Analyst',
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/resume/history');
      setHistory(res.data.resumes || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Poll for processing resumes
  useEffect(() => {
    const processing = history.some((r) => r.status === STATUS.processing);
    if (!processing) return;
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [history, fetchHistory]);

  const filteredSuggestions = ROLE_SUGGESTIONS.filter((r) =>
    r.toLowerCase().includes(targetRole.toLowerCase()) && targetRole.length > 0
  );

  const onDrop = useCallback(
    async (accepted, rejected) => {
      if (rejected.length > 0) {
        toast.error('Only PDF or Word documents are allowed (max 5MB)');
        return;
      }
      if (accepted.length === 0) return;

      const file = accepted[0];
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole.trim())    formData.append('targetRole', targetRole.trim());
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());

      setUploading(true);
      setShowSuggestions(false);
      try {
        await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(
          jobDescription.trim()
            ? 'Resume uploaded! Analyzing against job description...'
            : targetRole.trim()
            ? `Resume uploaded! Analyzing for "${targetRole}"...`
            : 'Resume uploaded! Analysis in progress...'
        );
        await fetchHistory();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed. Try again.');
      } finally {
        setUploading(false);
      }
    },
    [fetchHistory, targetRole]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/resume/${id}`);
      setHistory((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  const handleView = (resume) => {
    if (resume.status === STATUS.completed) navigate(`/analysis/${resume._id}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS.completed: return <HiCheckCircle className="status-icon status-icon--success" />;
      case STATUS.failed: return <HiExclamationCircle className="status-icon status-icon--error" />;
      default: return <div className="status-spinner" />;
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <motion.div
          className="dashboard__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="dashboard__title">
              Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="dashboard__subtitle">Upload your resume to get instant AI-powered feedback</p>
          </div>
          <div className="dashboard__stats">
            <div className="dashboard__stat">
              <HiChartBar />
              <span>{history.filter((r) => r.status === 'completed').length}</span>
              <small>Analyzed</small>
            </div>
          </div>
        </motion.div>

        <div className="dashboard__grid">
          {/* Upload Section */}
          <motion.div
            className="dashboard__upload-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="upload-section">
              <div className="upload-section__header">
                <HiCloudArrowUp />
                <h2>Upload Resume</h2>
              </div>

              {/* Target Role Input */}
              <div className="target-role">
                <label className="target-role__label">
                  <HiBriefcase />
                  Target Job Role
                  <span className="target-role__optional">optional but recommended</span>
                </label>
                <div className="target-role__input-wrap">
                  <input
                    type="text"
                    className="target-role__input"
                    placeholder="e.g. Software Engineer, Data Scientist..."
                    value={targetRole}
                    onChange={(e) => { setTargetRole(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    disabled={uploading}
                  />
                  {targetRole && (
                    <button
                      className="target-role__clear"
                      onClick={() => setTargetRole('')}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                  {/* Autocomplete dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul className="target-role__suggestions">
                      {filteredSuggestions.map((s) => (
                        <li
                          key={s}
                          className="target-role__suggestion"
                          onMouseDown={() => { setTargetRole(s); setShowSuggestions(false); }}
                        >
                          <HiBriefcase /> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>



                <p className="target-role__hint">
                  <HiKey />
                  Missing keywords will be tailored to this role for more accurate ATS feedback.
                </p>
              </div>

              {/* Job Description */}
              <div className="jd-section">
                <button
                  type="button"
                  className="jd-section__toggle"
                  onClick={() => setShowJD((v) => !v)}
                  disabled={uploading}
                >
                  <HiClipboardDocument />
                  <span>Paste Job Description</span>
                  <span className="jd-section__toggle-badge">
                    {jobDescription.trim() ? 'Added ✓' : 'Most accurate'}
                  </span>
                  {showJD ? <HiChevronUp className="jd-section__chevron" /> : <HiChevronDown className="jd-section__chevron" />}
                </button>

                {showJD && (
                  <div className="jd-section__body">
                    <textarea
                      className="jd-section__textarea"
                      placeholder="Paste the full job description here. The AI will extract exact keywords, required skills, and qualifications from it — giving you the most precise ATS match analysis."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={7}
                      disabled={uploading}
                    />
                    <div className="jd-section__footer">
                      <span className="jd-section__char-count">
                        {jobDescription.length} characters
                        {jobDescription.length > 50 && <span className="jd-section__char-count--ready"> · Ready</span>}
                      </span>
                      {jobDescription && (
                        <button
                          type="button"
                          className="jd-section__clear"
                          onClick={() => setJobDescription('')}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${isDragReject ? 'dropzone--reject' : ''} ${uploading ? 'dropzone--disabled' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="dropzone__content">
                  {uploading ? (
                    <>
                      <div className="dropzone__icon dropzone__icon--loading">
                        <Loader size="md" />
                      </div>
                      <p className="dropzone__text">Uploading & analyzing...</p>
                    </>
                  ) : isDragActive ? (
                    <>
                      <div className="dropzone__icon dropzone__icon--active">
                        <HiCloudArrowUp />
                      </div>
                      <p className="dropzone__text dropzone__text--active">Drop your resume here!</p>
                    </>
                  ) : (
                    <>
                      <div className="dropzone__icon">
                        <HiDocumentText />
                      </div>
                      <p className="dropzone__text">
                        <span>Click to upload</span> or drag & drop
                      </p>
                      <p className="dropzone__hint">PDF, DOC, DOCX · Max 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="upload-features">
                {[
                  'ATS Compatibility Score',
                  'Strengths & Weaknesses',
                  'Role-Specific Keywords',
                  'Actionable Suggestions',
                ].map((f, i) => (
                  <div key={i} className="upload-feature">
                    <HiCheckCircle className="upload-feature__icon" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* History Section */}
          <motion.div
            className="dashboard__history-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="history-section">
              <div className="history-section__header">
                <div className="history-section__title">
                  <HiDocumentText />
                  <h2>Resume History</h2>
                </div>
                <button className="history-section__refresh" onClick={fetchHistory} title="Refresh">
                  <FiRefreshCw />
                </button>
              </div>

              {loadingHistory ? (
                <div className="history-section__loading">
                  <Loader size="md" text="Loading history..." />
                </div>
              ) : history.length === 0 ? (
                <div className="history-empty">
                  <HiDocumentText className="history-empty__icon" />
                  <p>No resumes analyzed yet</p>
                  <span>Upload your first resume to get started</span>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="history-list">
                    {history.map((resume, i) => (
                      <motion.div
                        key={resume._id}
                        className={`history-item ${resume.status === STATUS.completed ? 'history-item--clickable' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleView(resume)}
                      >
                        <div className="history-item__icon">
                          <HiDocumentText />
                        </div>

                        <div className="history-item__info">
                          <p className="history-item__name">{resume.originalName}</p>
                          {resume.targetRole && (
                            <p className="history-item__role">
                              <HiBriefcase /> {resume.targetRole}
                            </p>
                          )}
                          <div className="history-item__meta">
                            <span>{new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {resume.status === STATUS.completed && (
                              <ScoreBadge score={resume.analysis?.atsScore || 0} />
                            )}
                            {resume.status === STATUS.processing && (
                              <span className="history-item__processing">
                                <HiClock /> Analyzing...
                              </span>
                            )}
                            {resume.status === STATUS.failed && (
                              <span className="history-item__failed">Analysis failed</span>
                            )}
                          </div>
                        </div>

                        <div className="history-item__actions">
                          {getStatusIcon(resume.status)}
                          {resume.status === STATUS.completed && (
                            <button
                              className="history-item__btn history-item__btn--view"
                              onClick={() => navigate(`/analysis/${resume._id}`)}
                              title="View Analysis"
                            >
                              <HiEye />
                            </button>
                          )}
                          <button
                            className="history-item__btn history-item__btn--delete"
                            onClick={(e) => handleDelete(resume._id, e)}
                            title="Delete"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
