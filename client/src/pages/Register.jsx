import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiEnvelope, HiLockClosed, HiUser, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.scss';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}! Let's analyze your resume.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
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
          <div className="auth__header">
            <Link to="/" className="auth__logo">
              <div className="auth__logo-icon"><HiSparkles /></div>
              <span>ATSResumeAI</span>
            </Link>
            <h1 className="auth__title">Create your account</h1>
            <p className="auth__subtitle">Start analyzing resumes with AI — completely free</p>
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label">Full Name</label>
              <div className="auth__input-wrap">
                <HiUser className="auth__input-icon" />
                <input
                  type="text"
                  name="name"
                  className="auth__input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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
              <label className="auth__label">
                Password
                <span className="auth__label-hint">min 6 characters</span>
              </label>
              <div className="auth__input-wrap">
                <HiLockClosed className="auth__input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="auth__input auth__input--pass"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="auth__toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
              {form.password && (
                <div className="auth__strength">
                  <div
                    className={`auth__strength-bar ${
                      form.password.length >= 10 ? 'strong' :
                      form.password.length >= 6 ? 'medium' : 'weak'
                    }`}
                  />
                  <span>{form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}</span>
                </div>
              )}
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? (
                <span className="auth__submit-loader" />
              ) : (
                <>
                  <FiUserPlus /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="auth__switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
