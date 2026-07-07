import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { loginUser, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already authenticated, bypass login
    if (user && !loading) {
      navigate('/');
    }
    setError(null);
  }, [user, loading, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!email || !password) {
      setValidationError('Please enter both your email address and password.');
      return;
    }

    const res = await loginUser(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-header">
            <h1 className="auth-logo" id="auth-logo">
              <span>FinVue</span>
            </h1>
            <p className="auth-subtitle">Login to access your financial dashboard.</p>
          </div>

          {(error || validationError) && (
            <div className="alert alert-danger" id="login-alert">
              <AlertCircle size={16} />
              <span>{error || validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  id="login-email"
                  className="input-field"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  id="login-password"
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} id="login-submit-btn">
              Sign In
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?
            <Link to="/register" id="link-to-register">Sign up</Link>
          </p>
        </div>
      </div>

      <div className="auth-hero-side">
        <div className="auth-hero-content">
          <h2 className="auth-hero-title">Track your wealth, securely.</h2>
          <p className="auth-hero-desc">
            FinVue uses advanced cookies authentication mechanisms, sanitizes query statements, and isolates
            transactions to protect your records. Set category thresholds and visually review trends.
          </p>
        </div>
        <div className="auth-hero-glow" />
      </div>
    </div>
  );
};

export default Login;
