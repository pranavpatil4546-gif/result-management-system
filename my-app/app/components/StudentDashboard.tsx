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

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [leaderboard, setLeaderboard] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`/api/students/${user.id}`);
        const data = await res.json();

        if (res.ok && data.student) {
          setStudent(data.student);
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user.id]);

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'A': return 'high';
      case 'B': return 'mid';
      default: return 'low';
    }
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'r1';
    if (rank === 2) return 'r2';
    if (rank === 3) return 'r3';
    return '';
  };

  const getGradeTagClass = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-A';
      case 'B': return 'grade-B';
      case 'C': return 'grade-C';
      default: return 'grade-F';
    }
  };

  if (loading) {
    return (
      <div className="student-page">
        <div className="topbar">
          <div className="topbar-brand">Result<span>MS</span></div>
          <div className="topbar-right">
            <div className="chip">
              <div className="avatar student">{user.name[0]?.toUpperCase()}</div>
              <span>{user.name}</span>
            </div>
            <button className="btn-sm red" onClick={onLogout}>Sign Out</button>
          </div>
        </div>
        <div className="student-body">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-page">
        <div className="topbar">
          <div className="topbar-brand">Result<span>MS</span></div>
          <div className="topbar-right">
            <div className="chip">
              <div className="avatar student">{user.name[0]?.toUpperCase()}</div>
              <span>{user.name}</span>
            </div>
            <button className="btn-sm red" onClick={onLogout}>Sign Out</button>
          </div>
        </div>
        <div className="student-body">
          <div className="no-result-state">
            <div className="no-result-icon">📋</div>
            <h2>No result found</h2>
            <p>Your marks haven&apos;t been entered yet.<br />Please contact your admin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="topbar">
        <div className="topbar-brand">Result<span>MS</span></div>
        <div className="topbar-right">
          <div className="chip">
            <div className="avatar student">{user.name[0]?.toUpperCase()}</div>
            <span>{user.name}</span>
          </div>
          <button className="btn-sm red" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="student-body">
        <div className="result-hero">
          <div className="result-hero-top">
            <div className="student-meta">
              <div className="student-ava-lg">{user.name[0]?.toUpperCase()}</div>
              <div>
                <div className="student-name-lg">{student.name}</div>
                <div className="student-id-lg">ID: {student.studentId.toLowerCase()}</div>
              </div>
            </div>
            <div className="rank-display">
              <div className="rank-number">#{student.rank}</div>
              <div className="rank-of">Class Rank</div>
            </div>
          </div>

          <div className="result-subjects">
            <div className="subj-cell">
              <div className="subj-label">📐 Maths</div>
              <div className={`subj-score ${getGradeClass(student.grade)}`}>{student.marks.maths}</div>
              <div className="subj-bar">
                <div
                  className={`subj-bar-fill ${getGradeClass(student.grade)}`}
                  style={{ width: `${student.marks.maths}%` }}
                />
              </div>
            </div>

            <div className="subj-cell">
              <div className="subj-label">🔬 Data Science</div>
              <div className={`subj-score ${getGradeClass(student.grade)}`}>{student.marks.dataScience}</div>
              <div className="subj-bar">
                <div
                  className={`subj-bar-fill ${getGradeClass(student.grade)}`}
                  style={{ width: `${student.marks.dataScience}%` }}
                />
              </div>
            </div>

            <div className="subj-cell">
              <div className="subj-label">📚 DBMS</div>
              <div className={`subj-score ${getGradeClass(student.grade)}`}>{student.marks.dbms}</div>
              <div className="subj-bar">
                <div
                  className={`subj-bar-fill ${getGradeClass(student.grade)}`}
                  style={{ width: `${student.marks.dbms}%` }}
                />
              </div>
            </div>

            <div className="subj-cell">
              <div className="subj-label">💻 Comp. Sci</div>
              <div className={`subj-score ${getGradeClass(student.grade)}`}>{student.marks.computer}</div>
              <div className="subj-bar">
                <div
                  className={`subj-bar-fill ${getGradeClass(student.grade)}`}
                  style={{ width: `${student.marks.computer}%` }}
                />
              </div>
            </div>
          </div>

          <div className="result-footer">
            <div className="result-stats">
              <div>
                <div className="rst-val">{student.total}</div>
                <div className="rst-key">Total Marks</div>
              </div>
              <div>
                <div className="rst-val">{student.percentage.toFixed(2)}%</div>
                <div className="rst-key">Percentage</div>
              </div>
            </div>
            <div className={`grade-tag ${getGradeTagClass(student.grade)}`}>
              Grade {student.grade}
            </div>
          </div>
        </div>

        <div className="lb-section-title">
          Class Leaderboard{' '}
          <span className="pill">{leaderboard.length} Student{leaderboard.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="lb-table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th className="center">Math</th>
                <th className="center">Data Sci</th>
                <th className="center">DBMS</th>
                <th className="center">CS</th>
                <th className="center">Total</th>
                <th className="center">%</th>
                <th className="center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((s) => (
                <tr key={s._id} className={s.studentId === student.studentId ? 'me' : ''}>
                  <td className={`lb-rank-cell ${getRankClass(s.rank)}`}>#{s.rank}</td>
                  <td className="lb-name-cell">
                    {s.name}
                    {s.studentId === student.studentId && <span className="me-tag">You</span>}
                  </td>
                  <td className="center">{s.marks.maths}</td>
                  <td className="center">{s.marks.dataScience}</td>
                  <td className="center">{s.marks.dbms}</td>
                  <td className="center">{s.marks.computer}</td>
                  <td className="center">{s.total}</td>
                  <td className="center lb-pct">{s.percentage.toFixed(2)}%</td>
                  <td className={`center ${getGradeClass(s.grade)}`}>{s.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
