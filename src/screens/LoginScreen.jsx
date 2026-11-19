import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, submitting, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // error shown via useAuth().error
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="12" fill="var(--amber)" />
              <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="#fff" />
              <circle cx="20" cy="20" r="3" fill="var(--amber)" />
            </svg>
          </div>
          <h1>SI-PKMK</h1>
          <p>Sistem Informasi Material Konstruksi</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email</label>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2.5 5.833A1.667 1.667 0 0 1 4.167 4.167h11.666A1.667 1.667 0 0 1 17.5 5.833v8.334a1.667 1.667 0 0 1-1.667 1.666H4.167A1.667 1.667 0 0 1 2.5 14.167V5.833z" />
                <path d="M2.5 5.833l7.5 5 7.5-5" />
              </svg>
              <input
                id="email-input"
                className="form-control"
                type="email"
                data-testid="email-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@sipkmk.local"
                required
                autoComplete="email"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Kata Sandi</label>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3.333" y="9.167" width="13.333" height="8.333" rx="1.667" />
                <path d="M6.667 9.167V5.833a3.333 3.333 0 1 1 6.666 0v3.334" />
              </svg>
              <input
                id="password-input"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                data-testid="password-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z" />
                    <circle cx="10" cy="10" r="2.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z" />
                    <circle cx="10" cy="10" r="2.5" />
                    <line x1="2.5" y1="17.5" x2="17.5" y2="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="login-hint">
          <p className="login-hint-title">Akun demo</p>
          <p className="login-hint-text">mandor@sipkmk.local · password</p>
        </div>
      </div>
    </div>
  );
}
