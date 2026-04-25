import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: 0, thumbnail: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/instructor/courses');
      setCourses(res.data.data);
    } catch (err) {
        console.error("Failed fetching", err);
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/instructor/courses', newCourse);
      setNewCourse({ title: '', description: '', price: 0, thumbnail: '' });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Instructor Dashboard</h2>
      
      <div className="glass-card" style={{ marginTop: '20px', marginBottom: '30px' }}>
        <h3>Create New Course</h3>
        <form onSubmit={createCourse} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
          <input type="text" placeholder="Title" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }} />
          <input type="text" placeholder="Description" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }} />
          <input type="number" placeholder="Price" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }} />
          <input type="text" placeholder="Thumbnail URL" value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} style={{ padding: '10px', borderRadius: '5px' }} />
          <button type="submit" className="btn-primary">Create</button>
        </form>
      </div>

      <h3>My Courses</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {courses.map(course => (
          <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4>{course.title}</h4>
              <p>Status: <span style={{ color: course.status === 'APPROVED' ? 'var(--success-color)' : 'var(--accent-color)' }}>{course.status}</span></p>
              <p>Price: ${course.price}</p>
            </div>
            <div style={{ marginTop: '15px' }}>
              <Link to={`/instructor/courses/${course.id}/edit`} className="btn-primary" style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}>
                Edit Curriculum
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InstructorDashboard;
