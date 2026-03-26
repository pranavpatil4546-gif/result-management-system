'use client';

import { useState } from 'react';

interface SignupPageProps {
  onSignupComplete: () => void;
}

interface StudentData {
  studentId: string;
  name: string;
  password: string;
  confirmPassword: string;
  maths: number;
  dataScience: number;
  dbms: number;
  computer: number;
}

export default function SignupPage({ onSignupComplete }: SignupPageProps) {
  const [formData, setFormData] = useState<StudentData>({
    studentId: '',
    name: '',
    password: '',
    confirmPassword: '',
    maths: 0,
    dataScience: 0,
    dbms: 0,
    computer: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('maths') || name.includes('dataScience') || name.includes('dbms') || name.includes('computer')
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.studentId || !formData.name || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    // Validate marks
    const marks = [formData.maths, formData.dataScience, formData.dbms, formData.computer];
    for (const mark of marks) {
      if (mark < 0 || mark > 100) {
        setError('Marks must be between 0 and 100');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId,
          name: formData.name,
          password: formData.password,
          marks: {
            maths: formData.maths,
            dataScience: formData.dataScience,
            dbms: formData.dbms,
            computer: formData.computer,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(`Student "${formData.name}" registered successfully!`);
      setFormData({
        studentId: '',
        name: '',
        password: '',
        confirmPassword: '',
        maths: 0,
        dataScience: 0,
        dbms: 0,
        computer: 0,
      });
      
      setTimeout(() => {
        onSignupComplete();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box" style={{ maxWidth: '500px' }}>
        <div className="login-logo">Result Management System</div>
        <h1>Register New <span>Student</span></h1>
        <p className="login-sub">Admin only - Create a new student account</p>

        {error && <div className="err-msg">{error}</div>}
        {success && <div className="success-msg" style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., STU001"
              required
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>Enter Marks (0-100)</label>
            
            <div className="field" style={{ marginBottom: '12px' }}>
              <label>Mathematics</label>
              <input
                type="number"
                name="maths"
                value={formData.maths}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            <div className="field" style={{ marginBottom: '12px' }}>
              <label>Data Science</label>
              <input
                type="number"
                name="dataScience"
                value={formData.dataScience}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            <div className="field" style={{ marginBottom: '12px' }}>
              <label>DBMS</label>
              <input
                type="number"
                name="dbms"
                value={formData.dbms}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            <div className="field" style={{ marginBottom: '12px' }}>
              <label>Computer</label>
              <input
                type="number"
                name="computer"
                value={formData.computer}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Registering...' : 'Register Student →'}
          </button>
        </form>

        <div className="hint-box">
          <strong>Note:</strong> This form is for admin use only. Fill in all details to create a new student account.
        </div>
      </div>
    </div>
  );
}
