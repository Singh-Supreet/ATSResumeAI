import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { FiLogIn } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.scss';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <motion.div
          className="auth__card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="auth__header">
            <Link to="/" className="auth__logo">
              <div className="auth__logo-icon"><HiSparkles /></div>
              <span>ATSResumeAI</span>
            </Link>
            <h1 className="auth__title">Welcome back</h1>
            <p className="auth__subtitle">Sign in to continue analyzing your resume</p>
          </div>

          {/* Form */}
          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label">Email Address</label>
              <div className="auth__input-wrap">
                <HiEnvelope className="auth__input-icon" />
                <input
                  type="email"
                  name="email"
                  className="auth__input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Password</label>
              <div className="auth__input-wrap">
                <HiLockClosed className="auth__input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="auth__input auth__input--pass"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="auth__toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? (
                <span className="auth__submit-loader" />
              ) : (
                <>
                  <FiLogIn /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="auth__switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
