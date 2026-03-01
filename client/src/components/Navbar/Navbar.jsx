import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiBarChart2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import './Navbar.scss';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <HiSparkles />
          </div>
          <span className="navbar__logo-text">ATSResume<span>AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links">
          <Link to="/#features" className="navbar__link">Features</Link>
          <Link to="/#how-it-works" className="navbar__link">How It Works</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="navbar__link">Dashboard</Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <div className="navbar__user">
                <div className="navbar__user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar__user-name">{user?.name?.split(' ')[0]}</span>
              </div>
              <button className="navbar__btn navbar__btn--ghost" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">Login</Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <Link to="/#features" className="navbar__mobile-link">Features</Link>
        <Link to="/#how-it-works" className="navbar__mobile-link">How It Works</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="navbar__mobile-link">
              <FiBarChart2 /> Dashboard
            </Link>
            <button className="navbar__mobile-link navbar__mobile-link--logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__mobile-link">Login</Link>
            <Link to="/register" className="navbar__mobile-link navbar__mobile-link--primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
