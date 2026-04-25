import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getCourseDetails, 
  addSectionToCourse, 
  addLessonToSection,
  updateSection,
  deleteSection,
  updateLesson,
  deleteLesson
} from '../../api/courseApi';

const InstructorCourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // SECTION STATES
  const [sectionTitle, setSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');

  // LESSON STATES
  const [activeLessonSection, setActiveLessonSection] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', contentType: 'VIDEO', contentUrl: '', duration: 0 });
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({ title: '', contentType: 'VIDEO', contentUrl: '', duration: 0 });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await getCourseDetails(id);
      setCourse(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  /* ▬▬▬ SECTION ACTIONS ▬▬▬ */
  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const orderIndex = course.sections ? course.sections.length : 0;
      await addSectionToCourse(id, { title: sectionTitle, orderIndex });
      setSectionTitle('');
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  const handleUpdateSection = async (e, sectionId) => {
    e.preventDefault();
    try {
      await updateSection(sectionId, { title: editSectionTitle });
      setEditingSectionId(null);
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure? This will delete all lessons inside this section too.")) return;
    try {
      await deleteSection(sectionId);
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  /* ▬▬▬ LESSON ACTIONS ▬▬▬ */
  const handleAddLesson = async (e, sectionId) => {
    e.preventDefault();
    try {
      const section = course.sections.find(s => s.id === sectionId);
      const orderIndex = section.lessons ? section.lessons.length : 0;
      await addLessonToSection(sectionId, { ...lessonForm, orderIndex });
      setLessonForm({ title: '', contentType: 'VIDEO', contentUrl: '', duration: 0 });
      setActiveLessonSection(null);
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  const handleUpdateLesson = async (e, lessonId) => {
    e.preventDefault();
    try {
      await updateLesson(lessonId, editLessonForm);
      setEditingLessonId(null);
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(lessonId);
      fetchCourse();
    } catch (err) { console.error(err); }
  };

  /* ▬▬▬ UI HELPERS ▬▬▬ */
  const startEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditSectionTitle(section.title);
  };

  const startEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonForm({
      title: lesson.title,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl,
      duration: lesson.duration
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Loading curriculum...</div>;
  if (!course) return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Course not found.</div>;

  const btnSecondaryStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' };
  const btnDangerStyle = { ...btnSecondaryStyle, border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' };
  const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' };

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: 'clamp(20px, 3vw, 24px)', color: 'var(--text-primary)' }}>Edit Curriculum: <span style={{ color: 'var(--accent-color)' }}>{course.title}</span></h2>
        <button onClick={() => navigate('/instructor/dashboard')} style={{ ...btnSecondaryStyle, padding: '8px 16px' }}>← Back to Dashboard</button>
      </div>

      {/* ADD SECTION */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Add New Section</h3>
        <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Section Title (e.g., 'Module 1: Introduction')" 
            value={sectionTitle} 
            onChange={e => setSectionTitle(e.target.value)} 
            required 
            style={{ ...inputStyle, flex: '1 1 300px', padding: '12px' }} 
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}>+ Add Section</button>
        </form>
      </div>

      {/* CURRICULUM LIST */}
      <div>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Current Curriculum</h3>
        {(!course.sections || course.sections.length === 0) ? (
          <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No sections built yet. Start adding!</div>
        ) : (
          course.sections.map((section, idx) => (
            <div key={section.id} className="glass-card" style={{ marginBottom: '20px', padding: '20px' }}>
              
              {/* === SECTION HEADER === */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                
                {/* Edit Section Form vs Display */}
                {editingSectionId === section.id ? (
                  <form onSubmit={(e) => handleUpdateSection(e, section.id)} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input type="text" value={editSectionTitle} onChange={e => setEditSectionTitle(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                    <button type="submit" style={btnSecondaryStyle}>Save</button>
                    <button type="button" onClick={() => setEditingSectionId(null)} style={btnSecondaryStyle}>Cancel</button>
                  </form>
                ) : (
                  <h4 style={{ fontSize: '18px', color: 'var(--accent-color)', fontWeight: 700, flex: 1 }}>
                    Section {idx + 1}: <span style={{ color: 'var(--text-primary)' }}>{section.title}</span>
                  </h4>
                )}

                {/* Section Action Buttons */}
                {editingSectionId !== section.id && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => startEditSection(section)} style={btnSecondaryStyle}>✏️ Edit</button>
                    <button onClick={() => handleDeleteSection(section.id)} style={btnDangerStyle}>🗑 Delete</button>
                    <button 
                      onClick={() => setActiveLessonSection(activeLessonSection === section.id ? null : section.id)}
                      style={{ ...btnSecondaryStyle, background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                    >
                      {activeLessonSection === section.id ? '✕ Cancel Lesson' : '+ Add Lesson'}
                    </button>
                  </div>
                )}
              </div>

              {/* === ADD LESSON FORM === */}
              {activeLessonSection === section.id && (
                <form onSubmit={(e) => handleAddLesson(e, section.id)} style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required style={{ ...inputStyle, flex: '1 1 200px' }} />
                  <select value={lessonForm.contentType} onChange={e => setLessonForm({...lessonForm, contentType: e.target.value})} style={{ ...inputStyle }}>
                    <option value="VIDEO">Video (YouTube URL)</option>
                    <option value="ARTICLE">Article (URL)</option>
                  </select>
                  <input type="text" placeholder="Content URL" value={lessonForm.contentUrl} onChange={e => setLessonForm({...lessonForm, contentUrl: e.target.value})} required style={{ ...inputStyle, flex: '1 1 300px' }} />
                  <input type="number" placeholder="Duration (m)" value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: e.target.value})} required style={{ ...inputStyle, width: '100px' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Save</button>
                </form>
              )}

              {/* === LESSONS LIST === */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(!section.lessons || section.lessons.length === 0) ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', paddingLeft: '16px', borderLeft: '2px solid var(--divider)' }}>No lessons added yet.</p>
                ) : (
                  section.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--divider)', borderRadius: '8px' }}>
                      
                      {/* Edit Lesson Form vs Display */}
                      {editingLessonId === lesson.id ? (
                        <form onSubmit={(e) => handleUpdateLesson(e, lesson.id)} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input type="text" value={editLessonForm.title} onChange={e => setEditLessonForm({...editLessonForm, title: e.target.value})} required style={{ ...inputStyle, flex: '1 1 200px' }} />
                          <select value={editLessonForm.contentType} onChange={e => setEditLessonForm({...editLessonForm, contentType: e.target.value})} style={inputStyle}>
                            <option value="VIDEO">Video</option>
                            <option value="ARTICLE">Article</option>
                          </select>
                          <input type="text" value={editLessonForm.contentUrl} onChange={e => setEditLessonForm({...editLessonForm, contentUrl: e.target.value})} required style={{ ...inputStyle, flex: '1 1 300px' }} />
                          <input type="number" value={editLessonForm.duration} onChange={e => setEditLessonForm({...editLessonForm, duration: e.target.value})} required style={{ ...inputStyle, width: '80px' }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ ...btnSecondaryStyle, background: 'var(--success-color)', color: '#fff', border: 'none' }}>Save</button>
                            <button type="button" onClick={() => setEditingLessonId(null)} style={btnSecondaryStyle}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{lIdx + 1}</div>
                            <strong style={{ color: 'var(--text-primary)' }}>{lesson.title}</strong>
                            <span style={{ fontSize: '11px', background: 'var(--badge-bg)', color: 'var(--badge-text)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{lesson.contentType}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>⏱ {lesson.duration}m</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => startEditLesson(lesson)} style={btnSecondaryStyle}>✏️ Edit</button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} style={btnDangerStyle}>🗑</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorCourseEdit;
