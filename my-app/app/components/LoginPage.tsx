'use client';

import { useState } from 'react';

interface LoginPageProps {
  onLogin: (user: { id: string; role: 'admin' | 'student'; name: string }) => void;
  onNavigateToSignup: () => void;
}

export default function LoginPage({ onLogin, onNavigateToSignup }: LoginPageProps) {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">Result Management System</div>
        <h1>Sign in to <span>your dashboard</span></h1>
        <p className="login-sub">Admin manages marks · Students view results & rank</p>

        <div className="role-tabs">
          <button
            className={`role-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => {
              setRole('student');
              setError('');
            }}
          >
            👤 Student
          </button>
          <button
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRole('admin');
              setError('');
            }}
          >
            🛡️ Admin
          </button>
        </div>

        {error && <div className="err-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{role === 'admin' ? 'Admin ID' : 'Student ID'}</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={role === 'admin' ? 'admin' : 'Enter your ID'}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button type="button" className="btn-sm" onClick={onNavigateToSignup}>
            Register a student
          </button>
        </div>

        <div className="hint-box">
          {role === 'admin' ? (
            <>
              <strong>Admin:</strong> ID: <strong>admin</strong> | Pass: <strong>admin123</strong>
            </>
          ) : (
            <>
              <strong>Student:</strong> Use the ID & password your admin gave you.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
