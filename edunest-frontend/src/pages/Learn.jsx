import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Learn = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
    connectWebSocket();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setCourse(res.data.data);
      setProgress(0); // Optional: Could fetch actual progress here
    } catch (err) {
      console.error(err);
    }
  };

  const connectWebSocket = () => {
    if (!user) return;
    
    // Create new stomp client
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:5000/ws/progress'),
      onConnect: () => {
        client.subscribe(`/topic/progress/${user.id}`, (message) => {
          if (message.body) {
            setProgress(parseFloat(message.body));
          }
        });
      },
      debug: (msg) => console.log(msg)
    });

    client.activate();
    setStompClient(client);
  };

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    markLessonComplete(lesson.id);
  }

  const markLessonComplete = (lessonId) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/lesson/complete',
        body: JSON.stringify({
          studentId: user.id,
          lessonId: lessonId
        })
      });
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', gap: '30px' }}>
      {/* Sidebar with modules/lessons */}
      <div className="glass-card" style={{ width: '300px', flexShrink: 0 }}>
        <h2>Course Content</h2>
        
        <div style={{ marginTop: '20px' }}>
          {course.sections?.map(section => (
            <div key={section.id} style={{ marginBottom: '15px' }}>
              <h4 style={{ color: 'var(--accent-color)' }}>{section.title}</h4>
              <ul style={{ listStyleType: 'none', paddingLeft: '10px', marginTop: '10px' }}>
                {section.lessons?.map(lesson => (
                  <li key={lesson.id} style={{ margin: '8px 0' }}>
                    <button 
                      onClick={() => selectLesson(lesson)}
                      style={{ 
                        background: activeLesson?.id === lesson.id ? 'rgba(255,255,255,0.1)' : 'transparent', 
                        border: '1px solid var(--accent-color)', 
                        color: 'var(--text-primary)', 
                        padding: '5px 10px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        width: '100%', 
                        textAlign: 'left' 
                      }}
                    >
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(!course.sections || course.sections.length === 0) && (
            <p>No sections available. (Instructor needs to add content)</p>
          )}
        </div>
      </div>
      
      {/* Video Player Area */}
      <div style={{ flex: 1 }}>
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{course.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Progress: {progress.toFixed(0)}%</span>
            <div style={{ width: '150px', height: '10px', background: 'var(--glass-border)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--success-color)', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', overflow: 'hidden', padding: 0 }}>
          {activeLesson ? (
            activeLesson.contentType === 'VIDEO' ? (
              <iframe 
                src={getEmbedUrl(activeLesson.contentUrl)} 
                title={activeLesson.title}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            ) : (
               <div style={{ padding: '20px', textAlign: 'center' }}>
                 <h3>{activeLesson.title}</h3>
                 <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>Read Article / Open Link</a>
               </div>
            )
          ) : (
            <h3 style={{ color: '#aaa' }}>{course.sections && course.sections.length > 0 ? "Select a lesson to start learning" : "No lessons available"}</h3>
          )}
        </div>
      </div>
    </div>
  );
};
export default Learn;
