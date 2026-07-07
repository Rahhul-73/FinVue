import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(''); // 'weak', 'medium', 'strong', 'excellent'
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { registerUser, user, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
    setError(null);
  }, [user, loading, navigate, setError]);

  // Dynamic Password Strength Assessment
  useEffect(() => {
    if (!password) {
      setStrength('');
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      setStrength('weak');
    } else if (score === 3) {
      setStrength('medium');
    } else if (score === 4) {
      setStrength('strong');
    } else {
      setStrength('excellent');
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setFieldErrors({});
    setError(null);

    // Frontend pre-check validations
    if (!name || !email || !password) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const res = await registerUser(name, email, password);
    if (res.success) {
      navigate('/');
    } else if (res.errors) {
      setFieldErrors(res.errors);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-header">
            <h1 className="auth-logo" id="auth-logo">
              <span>FinVue</span>
            </h1>
            <p className="auth-subtitle">Create a secure account to track your finances.</p>
          </div>

          {(error || validationError) && (
            <div className="alert alert-danger" id="register-alert">
              <AlertCircle size={16} />
              <span>{error || validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
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
                  type="text"
                  id="reg-name"
                  className="input-field"
                  placeholder="John Doe"
                  style={{ paddingLeft: '44px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {fieldErrors.name && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
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
                  id="reg-email"
                  className="input-field"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
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
                  id="reg-password"
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Dynamic strength indicator grid */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div className={`password-strength-bar strength-${strength}`}>
                    <div className="password-strength-segment" />
                    <div className="password-strength-segment" />
                    <div className="password-strength-segment" />
                    <div className="password-strength-segment" />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color:
                        strength === 'weak'
                          ? 'var(--danger-color)'
                          : strength === 'medium'
                          ? 'var(--warning-color)'
                          : strength === 'strong'
                          ? 'var(--success-color)'
                          : 'var(--secondary-color)',
                      textTransform: 'capitalize',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    Password Strength: {strength}
                  </span>
                </div>
              )}
              {fieldErrors.password && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '14px' }} id="register-submit-btn">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/login" id="link-to-login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-hero-side">
        <div className="auth-hero-content">
          <h2 className="auth-hero-title">Innovative budget limits & reports.</h2>
          <p className="auth-hero-desc">
            Organize transactions into categories, establish limits, and watch live status warnings adjust instantly as
            expenses roll in. Toggle lighting modes to match your preference.
          </p>
        </div>
        <div className="auth-hero-glow" />
      </div>
    </div>
  );
};

export default Register;
