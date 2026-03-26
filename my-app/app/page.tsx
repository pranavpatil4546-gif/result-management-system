'use client';

import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

interface User {
  id: string;
  role: 'admin' | 'student';
  name: string;
}

type PageView = 'login' | 'signup';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>('login');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedSession = localStorage.getItem('rms_session');

      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession) as User;
          setUser(parsed);
        } catch {
          localStorage.removeItem('rms_session');
        }
      }

      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rms_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rms_session');
  };

  const handleSignupComplete = () => {
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-box">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (user?.role === 'student') {
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onSignupComplete={handleSignupComplete} />;
  }

  return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />;
}
