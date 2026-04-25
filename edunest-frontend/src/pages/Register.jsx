import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: ['student'] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser({ ...formData, role: formData.role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--input-border)',
    marginTop: '6px',
    fontSize: '15px',
    outline: 'none',
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '420px', padding: '40px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '42px', marginBottom: '10px' }}>🎓</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Join thousands of learners today</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              placeholder="Min. 4 characters"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>I am a...</label>
            <select
              value={formData.role[0]}
              onChange={e => setFormData({...formData, role: [e.target.value]})}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="student">🎓 Student — I want to learn</option>
              <option value="instructor">👨‍🏫 Instructor — I want to teach</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '4px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
