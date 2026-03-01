import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiSparkles, HiBolt, HiShieldCheck, HiChartBar, HiDocumentText,
  HiArrowRight, HiCheckCircle, HiStar
} from 'react-icons/hi2';
import { FiUpload, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Home.scss';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' }
  }),
};

const features = [
  {
    icon: <HiChartBar />,
    title: 'ATS Score Analysis',
    desc: 'Get a precise ATS compatibility score and understand exactly how recruiters\' systems see your resume.',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    icon: <HiSparkles />,
    title: 'AI-Powered Insights',
    desc: 'Powered by Groq & Llama 3.3 70B to deliver human-level analysis with precise, actionable feedback.',
    gradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
  },
  {
    icon: <HiShieldCheck />,
    title: 'Strengths & Weaknesses',
    desc: 'Detailed breakdown of what works in your resume and what needs improvement, section by section.',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  {
    icon: <HiBolt />,
    title: 'Instant Results',
    desc: 'Receive comprehensive analysis within seconds, not hours. Upload and get insights immediately.',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
  },
  {
    icon: <HiDocumentText />,
    title: 'Keyword Optimization',
    desc: 'Discover missing keywords and phrases that ATS systems look for in your target industry.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    icon: <HiStar />,
    title: 'Career Insights',
    desc: 'Get job title recommendations and experience level assessment based on your resume content.',
    gradient: 'linear-gradient(135deg, #f43f5e, #f97316)',
  },
];

const steps = [
  {
    step: '01',
    icon: <FiUpload />,
    title: 'Upload Your Resume',
    desc: 'Drag & drop or click to upload your PDF or Word document. Supports all standard resume formats.',
  },
  {
    step: '02',
    icon: <FiCpu />,
    title: 'AI Analyzes',
    desc: 'Our Groq-powered Llama 3.3 AI processes your resume, evaluating every section against industry standards.',
  },
  {
    step: '03',
    icon: <FiTrendingUp />,
    title: 'Get Your Report',
    desc: 'Receive a detailed report with scores, insights, and actionable steps to improve your resume.',
  },
];

const stats = [
  { value: '95%', label: 'Accuracy Rate' },
  { value: '< 10s', label: 'Analysis Time' },
  { value: '50+', label: 'Data Points' },
  { value: 'Free', label: 'Always' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location]);

  return (
    <div className="home">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__container container">
          <motion.div className="hero__badge" initial="hidden" animate="visible" variants={fadeInUp} custom={0}>
            <HiSparkles /> AI-Powered Resume Analysis
          </motion.div>

          <motion.h1 className="hero__title" initial="hidden" animate="visible" variants={fadeInUp} custom={1}>
            Land Your Dream Job with
            <span className="hero__title-gradient"> AI Resume Analysis</span>
          </motion.h1>

          <motion.p className="hero__subtitle" initial="hidden" animate="visible" variants={fadeInUp} custom={2}>
            Upload your resume and get instant AI-powered feedback on ATS compatibility,
            strengths, weaknesses, and keyword optimization. Completely free.
          </motion.p>

          <motion.div className="hero__actions" initial="hidden" animate="visible" variants={fadeInUp} custom={3}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="hero__btn hero__btn--primary">
              Analyze My Resume <HiArrowRight />
            </Link>
            <Link to="/#how-it-works" className="hero__btn hero__btn--ghost">
              See How It Works
            </Link>
          </motion.div>

          <motion.div className="hero__stats" initial="hidden" animate="visible" variants={fadeInUp} custom={4}>
            {stats.map((s, i) => (
              <div key={i} className="hero__stat">
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Hero Card Preview */}
          <motion.div
            className="hero__preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="preview-card">
              <div className="preview-card__header">
                <div className="preview-card__dot preview-card__dot--red" />
                <div className="preview-card__dot preview-card__dot--yellow" />
                <div className="preview-card__dot preview-card__dot--green" />
                <span className="preview-card__title">Resume Analysis Report</span>
              </div>
              <div className="preview-card__body">
                <div className="preview-scores">
                  <div className="preview-score">
                    <div className="preview-score__ring" style={{ '--score': '82%', '--color': '#6366f1' }}>
                      <span>82</span>
                    </div>
                    <p>ATS Score</p>
                  </div>
                  <div className="preview-score">
                    <div className="preview-score__ring" style={{ '--score': '74%', '--color': '#10b981' }}>
                      <span>74</span>
                    </div>
                    <p>Overall</p>
                  </div>
                  <div className="preview-score">
                    <div className="preview-score__ring" style={{ '--score': '90%', '--color': '#06b6d4' }}>
                      <span>90</span>
                    </div>
                    <p>Keywords</p>
                  </div>
                </div>
                <div className="preview-items">
                  {['Strong technical skills section', 'Clear work experience', 'ATS-friendly format'].map((item, i) => (
                    <div key={i} className="preview-item preview-item--good">
                      <HiCheckCircle /> {item}
                    </div>
                  ))}
                  {['Add measurable achievements', 'Include more keywords'].map((item, i) => (
                    <div key={i} className="preview-item preview-item--warn">
                      <HiSparkles /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-header__badge">Features</span>
            <h2 className="section-header__title">Everything You Need to <span className="gradient-text">Get Hired</span></h2>
            <p className="section-header__subtitle">
              Our AI analyzes 50+ data points to give you the most comprehensive resume feedback available.
            </p>
          </motion.div>

          <div className="features__grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={i * 0.5}
              >
                <div className="feature-card__icon" style={{ background: f.gradient }}>
                  {f.icon}
                </div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-header__badge">Process</span>
            <h2 className="section-header__title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-header__subtitle">
              Three simple steps to transform your resume into an interview magnet.
            </p>
          </motion.div>

          <div className="steps">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className="step"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={i * 0.5}
              >
                <div className="step__number">{s.step}</div>
                <div className="step__icon">{s.icon}</div>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="step__connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="cta">
        <div className="container">
          <motion.div
            className="cta__card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="cta__glow" />
            <HiSparkles className="cta__icon" />
            <h2 className="cta__title">Ready to Land Your Dream Job?</h2>
            <p className="cta__subtitle">
              Join thousands of job seekers who have improved their resumes with AI-powered insights.
              It's completely free — no credit card required.
            </p>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="cta__btn">
              Start Analyzing for Free <HiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <HiSparkles />
              <span>ATSResumeAI</span>
            </div>
            <p className="footer__copy">© 2024 ATSResumeAI. Powered by Groq & Llama 3.3 70B.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
