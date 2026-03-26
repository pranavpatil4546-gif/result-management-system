'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  role: string;
  name: string;
}

interface Student {
  _id: string;
  studentId: string;
  name: string;
  marks: {
    maths: number;
    dataScience: number;
    dbms: number;
    computer: number;
  };
  total: number;
  percentage: number;
  grade: string;
  rank: number;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [maths, setMaths] = useState('');
  const [dataScience, setDataScience] = useState('');
  const [dbms, setDbms] = useState('');
  const [computer, setComputer] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !name || !password || !maths || !dataScience || !dbms || !computer) {
      showToast('error', 'Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          name,
          password,
          marks: {
            maths: Number(maths),
            dataScience: Number(dataScience),
            dbms: Number(dbms),
            computer: Number(computer),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save student');
      }

      showToast('success', `"${name}" saved successfully!`);
      
      // Reset form
      setStudentId('');
      setName('');
      setPassword('');
      setMaths('');
      setDataScience('');
      setDbms('');
      setComputer('');

      // Refresh list
      fetchStudents();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save student');
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Delete student "${studentName}"?`)) return;

    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }

      showToast('success', 'Student deleted successfully');
      fetchStudents();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'A': return 'high';
      case 'B': return 'mid';
      default: return 'low';
    }
  };

  return (
    <div className="student-page admin-page">
      <div className="topbar">
        <div className="topbar-brand">
          Result<span>MS</span>{' '}
          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 400, marginLeft: 6 }}>
            Admin Panel
          </span>
        </div>
        <div className="topbar-right">
          <div className="chip">
            <div className="avatar admin">A</div>
            <span>{user.name}</span>
          </div>
          <button className="btn-sm red" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-left">
          <div className="panel-title">Add / Update Student</div>
          <div className="panel-sub">Fill all fields and save</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU001"
              />
            </div>

            <div className="field">
              <label>Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="field">
              <label>Student Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Student will use this to login"
              />
            </div>

            <div className="divider"></div>

            <div className="panel-sub" style={{ marginBottom: 16 }}>📊 Marks (out of 100)</div>

            <div className="subject-inputs">
              <div className="field">
                <label>📐 Maths</label>
                <input
                  type="number"
                  value={maths}
                  onChange={(e) => setMaths(e.target.value)}
                  placeholder="0–100"
                  min="0"
                  max="100"
                />
              </div>

              <div className="field">
                <label>🔬 Data Science</label>
                <input
                  type="number"
                  value={dataScience}
                  onChange={(e) => setDataScience(e.target.value)}
                  placeholder="0–100"
                  min="0"
                  max="100"
                />
              </div>

              <div className="field">
                <label>📚 DBMS</label>
                <input
                  type="number"
                  value={dbms}
                  onChange={(e) => setDbms(e.target.value)}
                  placeholder="0–100"
                  min="0"
                  max="100"
                />
              </div>

              <div className="field">
                <label>💻 Comp. Sci</label>
                <input
                  type="number"
                  value={computer}
                  onChange={(e) => setComputer(e.target.value)}
                  placeholder="0–100"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <button type="submit" className="btn-add">＋ Save Student</button>

            {toast && (
              <div className={`toast ${toast.type} ${toast.type === 'success' ? 'success' : ''}`}>
                {toast.message}
              </div>
            )}
          </form>
        </div>

        <div className="admin-right">
          <div className="admin-right-header">
            <h2>All Student Records</h2>
            <span className="count-badge">{students.length} Student{students.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th className="center">Math</th>
                  <th className="center">Data Sci</th>
                  <th className="center">DBMS</th>
                  <th className="center">CS</th>
                  <th className="center">Total</th>
                  <th className="center">%</th>
                  <th className="center">Grade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '60px 24px' }}>
                      Loading...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-table">
                        <h3>No students yet</h3>
                        <p>Use the form on the left to add students.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td className="td-id">{student.studentId.toLowerCase()}</td>
                      <td className="td-name">{student.name}</td>
                      <td className="center">{student.marks.maths}</td>
                      <td className="center">{student.marks.dataScience}</td>
                      <td className="center">{student.marks.dbms}</td>
                      <td className="center">{student.marks.computer}</td>
                      <td className="center">{student.total}</td>
                      <td className="center">{student.percentage.toFixed(2)}</td>
                      <td className={`center ${getGradeClass(student.grade)}`}>{student.grade}</td>
                      <td className="center">
                        <button
                          className="btn-del"
                          onClick={() => handleDelete(student.studentId, student.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
