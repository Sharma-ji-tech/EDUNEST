import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Passive scroll listener — no jank
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setMobileOpen(false);
  }, [logout, navigate]);

  const getDashboardLink = () => {
    if (!user) return '/';
    const role = user.roles || user.role;
    if (role === 'ROLE_ADMIN' || role?.includes('ROLE_ADMIN')) return '/admin/dashboard';
    if (role === 'ROLE_INSTRUCTOR' || role?.includes('ROLE_INSTRUCTOR')) return '/instructor/dashboard';
    return '/student/dashboard';
  };

  const navBg = scrolled
    ? 'var(--nav-bg)'
    : isDark ? 'transparent' : 'rgba(255,255,255,0.6)';

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 clamp(1rem, 4vw, 2rem)',
    height: '64px',
    background: navBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${scrolled ? 'var(--glass-border)' : 'transparent'}`,
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: scrolled ? `0 2px 20px var(--shadow)` : 'none',
  };

  const linkStyle = {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'color 0.2s ease',
    display: 'block',
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link to="/" style={linkStyle}>Courses</Link>
      {user ? (
        <>
          <Link to={getDashboardLink()} style={linkStyle}>Dashboard</Link>
          {!mobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'var(--glass-bg)', borderRadius: '999px', border: '1px solid var(--glass-border)' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.2s' }}
          >
            ⏏ Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link
            to="/register"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '9px 18px', borderRadius: '10px', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', display: 'inline-block' }}
          >
            Sign Up →
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 3px 10px rgba(59,130,246,0.35)', flexShrink: 0 }}>
            🎓
          </div>
          <span style={{ fontWeight: 800, fontSize: 'clamp(18px, 3vw, 22px)', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EduNest
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <NavLinks />
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="theme-toggle" onClick={toggleTheme} style={{ display: 'none' }} title={isDark ? 'Light Mode' : 'Dark Mode'} id="theme-toggle-mobile">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="nav-links-mobile">
          <NavLinks mobile />
          <button className="theme-toggle" onClick={toggleTheme} style={{ width: '100%', borderRadius: '10px', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px' }}>
            {isDark ? '☀️  Switch to Light Mode' : '🌙  Switch to Dark Mode'}
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
