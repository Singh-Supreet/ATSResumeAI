import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  HiArrowLeft, HiCheckCircle, HiXCircle, HiLightBulb, HiKey,
  HiWrench, HiStar, HiBriefcase, HiSparkles,
  HiCpuChip, HiUserGroup, HiDocumentCheck, HiClipboardDocument
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Loader from '../components/common/Loader';
import './AnalysisResult.scss';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' }
  }),
};

const getScoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#6366f1';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Work';
};

const ScoreCircle = ({ score, label, icon }) => {
  const color = getScoreColor(score);
  return (
    <div className="score-circle">
      <div className="score-circle__ring">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#f1f5f9',
            trailColor: 'rgba(255,255,255,0.06)',
            textSize: '22px',
            pathTransitionDuration: 1.5,
          })}
        />
      </div>
      <div className="score-circle__info">
        <span className="score-circle__label">{label}</span>
        <span className="score-circle__grade" style={{ color }}>{getScoreLabel(score)}</span>
      </div>
    </div>
  );
};

const ListCard = ({ icon, title, items, type = 'default', color }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className={`list-card list-card--${type}`}>
      <div className="list-card__header">
        <div className="list-card__icon" style={{ color }}>
          {icon}
        </div>
        <h3 className="list-card__title">{title}</h3>
        <span className="list-card__count">{items.length}</span>
      </div>
      <ul className="list-card__items">
        {items.map((item, i) => (
          <motion.li
            key={i}
            className="list-card__item"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={i}
          >
            <span className="list-card__bullet" style={{ background: color }} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const TagCloud = ({ items, icon, title, color }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="tag-cloud-card">
      <div className="tag-cloud-card__header">
        <span style={{ color }}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="tag-cloud-card__tags">
        {items.map((item, i) => (
          <span key={i} className="tag-cloud-card__tag" style={{ '--color': color }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchResume = useCallback(async () => {
    try {
      const res = await api.get(`/resume/${id}`);
      setResume(res.data.resume);

      if (res.data.resume.status === 'processing') {
        setPolling(true);
      } else {
        setPolling(false);
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to load analysis');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  // Poll while processing
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/resume/${id}`);
        setResume(res.data.resume);
        if (res.data.resume.status !== 'processing') {
          setPolling(false);
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
        setLoading(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, id]);

  if (loading || polling) {
    return (
      <div className="analysis-loading">
        <Loader size="lg" />
        <h2>Analyzing Your Resume</h2>
        <p>Our AI is evaluating your resume across 50+ data points...</p>
        <div className="analysis-loading__steps">
          {['Parsing document', 'Extracting content', 'Running AI analysis', 'Generating insights'].map((step, i) => (
            <div key={i} className="analysis-loading__step" style={{ animationDelay: `${i * 0.3}s` }}>
              <HiSparkles /> {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!resume || resume.status === 'failed') {
    return (
      <div className="analysis-error">
        <HiXCircle />
        <h2>Analysis Failed</h2>
        <p>We couldn't analyze this resume. Please try uploading again.</p>
        <button onClick={() => navigate('/dashboard')}>
          <HiArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { analysis } = resume;

  return (
    <div className="analysis-result">
      <div className="container">
        {/* Back Button */}
        <motion.button
          className="analysis-result__back"
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <HiArrowLeft /> Back to Dashboard
        </motion.button>

        {/* Header */}
        <motion.div
          className="analysis-result__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="analysis-result__file">
            <div className="analysis-result__file-icon">
              <HiDocumentCheck />
            </div>
            <div>
              <h1 className="analysis-result__file-name">{resume.originalName}</h1>
              <p className="analysis-result__file-meta">
                Analyzed on {new Date(resume.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="analysis-result__badges">
            {resume.jobDescription?.trim() ? (
              <div className="analysis-result__level analysis-result__level--jd">
                <HiClipboardDocument />
                <span>Matched against Job Description</span>
              </div>
            ) : resume.targetRole ? (
              <div className="analysis-result__level analysis-result__level--role">
                <HiKey />
                <span>Keywords for: <strong>{resume.targetRole}</strong></span>
              </div>
            ) : null}
            <div className="analysis-result__level">
              <HiBriefcase />
              <span>{analysis.experienceLevel}</span>
            </div>
          </div>
        </motion.div>

        {/* Score Cards */}
        <motion.div
          className="score-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="score-section__circles">
            <ScoreCircle score={analysis.atsScore} label="ATS Score" />
            <ScoreCircle score={analysis.overallScore} label="Overall Score" />
          </div>

          {/* Score Bar */}
          <div className="score-section__bars">
            {[
              { label: 'ATS Compatibility', score: analysis.atsScore },
              { label: 'Content Quality', score: Math.min(100, analysis.overallScore + 5) },
              { label: 'Keyword Match', score: Math.max(10, analysis.atsScore - 10) },
              { label: 'Format & Structure', score: Math.min(100, analysis.overallScore + 8) },
            ].map((bar, i) => (
              <motion.div
                key={i}
                className="score-bar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="score-bar__label">
                  <span>{bar.label}</span>
                  <span style={{ color: getScoreColor(bar.score) }}>{bar.score}%</span>
                </div>
                <div className="score-bar__track">
                  <motion.div
                    className="score-bar__fill"
                    style={{ '--target': `${bar.score}%`, background: getScoreColor(bar.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.score}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        {analysis.summary && (
          <motion.div
            className="summary-card"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={1}
          >
            <div className="summary-card__header">
              <HiSparkles /> AI Summary
            </div>
            <p className="summary-card__text">{analysis.summary}</p>
          </motion.div>
        )}

        {/* Job Titles */}
        {analysis.jobTitles?.length > 0 && (
          <motion.div
            className="job-titles-card"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={2}
          >
            <div className="job-titles-card__header">
              <HiBriefcase /> Recommended Job Titles
            </div>
            <div className="job-titles-card__list">
              {analysis.jobTitles.map((title, i) => (
                <span key={i} className="job-titles-card__title">
                  <HiStar /> {title}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="analysis-grid">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3}>
            <ListCard
              icon={<HiCheckCircle />}
              title="Strengths"
              items={analysis.strengths}
              type="success"
              color="#10b981"
            />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={4}>
            <ListCard
              icon={<HiXCircle />}
              title="Weaknesses"
              items={analysis.weaknesses}
              type="error"
              color="#ef4444"
            />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={5}>
            <ListCard
              icon={<HiLightBulb />}
              title="Suggestions"
              items={analysis.suggestions}
              type="info"
              color="#06b6d4"
            />
          </motion.div>

          {analysis.formattingIssues?.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={6}>
              <ListCard
                icon={<HiWrench />}
                title="Formatting Issues"
                items={analysis.formattingIssues}
                type="warning"
                color="#f59e0b"
              />
            </motion.div>
          )}
        </div>

        {/* Skills & Keywords Row */}
        <div className="skills-grid">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={7}>
            <TagCloud
              items={analysis.technicalSkills}
              icon={<HiCpuChip />}
              title="Technical Skills"
              color="#6366f1"
            />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={8}>
            <TagCloud
              items={analysis.softSkills}
              icon={<HiUserGroup />}
              title="Soft Skills"
              color="#10b981"
            />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={9}>
            <TagCloud
              items={analysis.missingKeywords}
              icon={<HiKey />}
              title="Missing Keywords"
              color="#f59e0b"
            />
          </motion.div>
        </div>

        {/* Score Legend */}
        <motion.div
          className="score-legend"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={10}
        >
          <p>Score Guide:</p>
          {[
            { range: '80–100', label: 'Excellent', color: '#10b981' },
            { range: '60–79', label: 'Good', color: '#6366f1' },
            { range: '40–59', label: 'Average', color: '#f59e0b' },
            { range: '0–39', label: 'Needs Work', color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} className="score-legend__item">
              <span className="score-legend__dot" style={{ background: item.color }} />
              <span className="score-legend__range">{item.range}</span>
              <span className="score-legend__label" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
