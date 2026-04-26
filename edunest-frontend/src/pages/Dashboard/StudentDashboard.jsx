import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments/my');
      setEnrollments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCert = async (courseId) => {
    try {
      const res = await api.get(`/certificate/${courseId}`);
      window.open('https://edunest-1-6xkb.onrender.com' + res.data.data, '_blank');
    } catch (err) {
        alert('Certificate is not yet available for this course.');
    }
  };

  return (
    <div>
      <h2>My Enrolled Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {enrollments.map(course => (
          <div key={course.id} className="glass-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <Link to={`/learn/${course.id}`} className="btn-primary" style={{ padding: '8px 15px', fontSize: '14px' }}>Continue Learning</Link>
              <button 
                onClick={() => handleDownloadCert(course.id)} 
                className="btn-primary" 
                style={{ padding: '8px 15px', fontSize: '14px', background: 'var(--success-color)' }}
              >
                Certificate
              </button>
            </div>
          </div>
        ))}
      </div>
      {enrollments.length === 0 && <p>You have not enrolled in any courses yet.</p>}
    </div>
  );
};
export default StudentDashboard;
