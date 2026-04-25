import React, { useEffect, useState, useRef } from 'react';
import { getPublicCourses } from '../api/courseApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Floating orbs animated background ─── */
const AnimatedBG = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
    <div style={orbStyle('#3b82f6', '10%', '-5%', '600px', '80s')} />
    <div style={orbStyle('#8b5cf6', '70%', '60%', '500px', '60s')} />
    <div style={orbStyle('#06b6d4', '85%', '10%', '400px', '100s')} />
    <div style={orbStyle('#ec4899', '20%', '80%', '350px', '70s')} />
  </div>
);
function orbStyle(color, left, top, size, duration) {
  return {
    position: 'absolute', left, top, width: size, height: size, borderRadius: '50%',
    background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
    animation: `orbFloat ${duration} ease-in-out infinite alternate`,
    filter: 'blur(40px)',
  };
}

/* ─── Stat counter hook ─── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Intersection observer hook ─── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Stats section ─── */
const stats = [
  { value: 50000, label: 'Students Enrolled', suffix: '+' },
  { value: 200, label: 'Expert Instructors', suffix: '+' },
  { value: 1200, label: 'Courses Available', suffix: '+' },
  { value: 98, label: 'Satisfaction Rate', suffix: '%' },
];

const StatCard = ({ value, label, suffix, animate }) => {
  const count = useCounter(value, 2000, animate);
  return (
    <div style={styles.statCard}>
      <div style={styles.statNumber}>{count.toLocaleString()}{suffix}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
};

/* ─── Features ─── */
const features = [
  { icon: '🎓', title: 'Expert-Led Courses', desc: 'Learn from industry professionals with real-world experience and proven track records.' },
  { icon: '⚡', title: 'Learn at Your Pace', desc: 'Access courses anytime, anywhere. Pause, replay, and learn at a speed that suits you.' },
  { icon: '🏆', title: 'Earn Certificates', desc: 'Get verified PDF certificates upon completion to showcase your skills to employers.' },
  { icon: '📊', title: 'Track Your Progress', desc: 'Real-time progress tracking via WebSockets lets you stay on top of your learning journey.' },
  { icon: '💬', title: 'Community Support', desc: 'Join thousands of learners and collaborate in a thriving educational ecosystem.' },
  { icon: '🔒', title: 'Secure & Trusted', desc: 'Enterprise-grade security with JWT authentication and encrypted payment processing.' },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Priya Sharma', role: 'Frontend Developer', text: 'EduNest helped me land my dream job! The courses are incredibly well-structured and the certificate meant a lot to my employer.', avatar: '👩‍💻' },
  { name: 'Rahul Verma', role: 'Data Analyst', text: 'I completed 3 courses in 2 months. The progress tracking kept me motivated and the instructors were absolutely world-class.', avatar: '👨‍💼' },
  { name: 'Ananya Patel', role: 'UX Designer', text: "The platform is beautiful and intuitive. Learning here doesn't feel like studying – it feels like an adventure!", avatar: '👩‍🎨' },
];

/* ─── Main Component ─── */
const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [statsRef, statsInView] = useInView(0.2);
  const [featRef, featInView] = useInView(0.1);

  useEffect(() => {
    getPublicCourses().then(setCourses).catch(console.error);
    // Inject keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes orbFloat { from { transform: translate(0,0) scale(1); } to { transform: translate(30px, 50px) scale(1.1); } }
      @keyframes fadeInUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes fadeInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
      @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
      @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
      .course-card:hover { transform: translateY(-8px) scale(1.01) !important; box-shadow: 0 20px 60px rgba(59,130,246,0.3) !important; }
      .feature-card:hover { transform: translateY(-6px) !important; border-color: rgba(139,92,246,0.5) !important; }
      .testimonial-card:hover { border-color: rgba(59,130,246,0.4) !important; }
      .cta-btn:hover { transform: translateY(-3px) scale(1.03) !important; box-shadow: 0 12px 30px rgba(59,130,246,0.5) !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBG />
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ HERO ═══ */}
        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeDot} />
            🚀 Next-Gen Learning Platform
          </div>

          <div style={styles.heroContent}>
            <div style={{ animation: 'fadeInLeft 0.8s ease forwards' }}>
              <h1 style={styles.heroTitle}>
                Unlock Your
                <span style={styles.gradientText}> Full Potential</span>
                <br />with EduNest
              </h1>
              <p style={styles.heroSubtitle}>
                Master in-demand skills from world-class instructors. Earn verified certificates
                and accelerate your career with our AI-powered learning platform.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '32px' }}>
                {user ? (
                  <Link to="/student/dashboard" className="cta-btn" style={styles.ctaBtn}>
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="cta-btn" style={styles.ctaBtn}>
                      Start Learning Free →
                    </Link>
                    <Link to="/login" style={styles.ctaBtnOutline}>
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
                {['⭐ 4.9/5 Rating', '🌍 50K+ Learners', '📜 Verified Certificates'].map(item => (
                  <div key={item} style={styles.heroBadgeSmall}>{item}</div>
                ))}
              </div>
            </div>

            <div style={{ animation: 'fadeInRight 0.9s ease forwards', display: 'flex', justifyContent: 'center' }}>
              <div style={styles.heroImageWrapper}>
                <img
                  src="/hero.png"
                  alt="EduNest Learning Platform"
                  style={styles.heroImage}
                />
                {user && (
                  <>
                    <div style={styles.floatingCard1}>
                      <div style={{ fontSize: '22px' }}>🎓</div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Completed Today</div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>React Masterclass</div>
                      </div>
                    </div>
                    <div style={styles.floatingCard2}>
                      <div style={{ fontSize: '22px' }}>📈</div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Progress</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>+47% This Week</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section ref={statsRef} style={styles.statsSection}>
          <div style={styles.inner}>
            <div style={styles.statsGrid}>
              {stats.map((s) => <StatCard key={s.label} {...s} animate={statsInView} />)}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section ref={featRef} style={{ padding: '100px 0' }}>
          <div style={styles.inner}>
            <div style={{ textAlign: 'center', marginBottom: '60px', animation: featInView ? 'fadeInUp 0.7s ease forwards' : 'none', opacity: featInView ? 1 : 0 }}>
              <div style={styles.sectionTag}>Why Choose Us</div>
              <h2 style={styles.sectionTitle}>Everything You Need to <span style={styles.gradientText}>Succeed</span></h2>
              <p style={styles.sectionSubtitle}>A complete ecosystem built to take your skills from zero to industry-ready</p>
            </div>
            <div style={styles.featuresGrid}>
              {features.map((f, i) => (
                <div key={f.title} className="feature-card" style={{ ...styles.featureCard, animationDelay: `${i * 0.1}s`, opacity: featInView ? 1 : 0, animation: featInView ? `fadeInUp 0.6s ease ${i * 0.1}s forwards` : 'none' }}>
                  <div style={styles.featureIcon}>{f.icon}</div>
                  <h3 style={styles.featureTitle}>{f.title}</h3>
                  <p style={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ COURSES ═══ */}
        {courses.length > 0 && (
          <section style={{ padding: '80px 0 100px' }}>
            <div style={styles.inner}>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={styles.sectionTag}>Live Courses</div>
                <h2 style={styles.sectionTitle}>Start Learning <span style={styles.gradientText}>Today</span></h2>
                <p style={styles.sectionSubtitle}>Handpicked courses from our expert instructors — ready for you right now</p>
              </div>
              <div style={styles.coursesGrid}>
                {courses.map((course, i) => (
                  <div key={course.id} className="course-card" style={{ ...styles.courseCard, animationDelay: `${i * 0.1}s` }}>
                    <div style={styles.courseCardHeader}>
                      <div style={styles.courseIconBg}>📚</div>
                      <div style={styles.courseBadge}>LIVE</div>
                    </div>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <p style={styles.courseDesc}>{course.description?.substring(0, 90)}...</p>
                    <div style={styles.courseMeta}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>INSTRUCTOR</div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{course.instructorName || 'Expert Instructor'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>PRICE</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          ₹{course.price}
                        </div>
                      </div>
                    </div>
                    <Link to={`/courses/${course.id}`} style={styles.enrollBtn}>
                      View Course →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{ padding: 'clamp(40px, 8vw, 80px) 0', background: 'var(--glass-bg)' }}>
          <div style={styles.inner}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={styles.sectionTag}>Student Reviews</div>
              <h2 style={styles.sectionTitle}>Loved by <span style={styles.gradientText}>Thousands</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px, 3vw, 24px)' }}>
              {testimonials.map((t) => (
                <div key={t.name} className="testimonial-card" style={styles.testimonialCard}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{"⭐".repeat(5)}</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px', fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.avatarCircle}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>{t.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section style={styles.ctaBanner}>
          <div style={styles.inner}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, marginBottom: '16px' }}>
                Ready to Transform Your <span style={styles.gradientText}>Career?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2vw, 18px)', marginBottom: '40px' }}>
                Join 50,000+ learners who are already building their future with EduNest.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="cta-btn" style={{ ...styles.ctaBtn, padding: '16px 40px', fontSize: '18px' }}>
                  Get Started for Free →
                </Link>
                <Link to="/courses" style={{ ...styles.ctaBtnOutline, padding: '16px 40px', fontSize: '18px' }}>
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.inner}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🎓</span>
                <span style={{ fontWeight: 800, fontSize: '20px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduNest</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>© 2026 EduNest. All rights reserved.</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                  Designed  by <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Abhishek Sharma</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Login</Link>
                <Link to="/register" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Register</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

/* ─── Styles (fully theme-aware) ─── */
const styles = {
  inner: { maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' },
  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(4rem, 10vh, 7rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 5vh, 4rem)', maxWidth: '1280px', margin: '0 auto' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)', borderRadius: '999px', padding: '6px 16px', fontSize: '14px', color: 'var(--badge-text)', marginBottom: '28px', width: 'fit-content' },
  badgeDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-color)', animation: 'pulse 2s infinite' },
  heroContent: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(30px, 6vw, 60px)', alignItems: 'center' },
  heroTitle: { fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-1px', color: 'var(--text-primary)' },
  gradientText: { background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' },
  heroSubtitle: { fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '520px' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: '#fff', padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)', borderRadius: '12px', fontWeight: 700, fontSize: 'clamp(14px, 2vw, 16px)', textDecoration: 'none', transition: 'all 0.3s ease', cursor: 'pointer', border: 'none' },
  ctaBtnOutline: { display: 'inline-block', background: 'transparent', color: 'var(--text-primary)', padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)', borderRadius: '12px', fontWeight: 600, fontSize: 'clamp(14px, 2vw, 16px)', textDecoration: 'none', border: '1.5px solid var(--glass-border)', transition: 'all 0.3s ease' },
  heroBadgeSmall: { fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' },
  heroImageWrapper: { position: 'relative', animation: 'float 4s ease-in-out infinite' },
  heroImage: { width: '100%', maxWidth: '520px', borderRadius: '24px', boxShadow: '0 40px 80px rgba(59,130,246,0.2)', border: '1px solid var(--glass-border)' },
  floatingCard1: { position: 'absolute', bottom: '-20px', left: '-20px', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px var(--shadow)', animation: 'fadeInUp 1s 0.5s forwards', opacity: 0 },
  floatingCard2: { position: 'absolute', top: '-20px', right: '-20px', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px var(--shadow)', animation: 'fadeInUp 1s 0.7s forwards', opacity: 0 },
  statsSection: { padding: 'clamp(20px, 4vw, 40px) 0 clamp(40px, 8vw, 80px)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 'clamp(12px, 3vw, 24px)' },
  statCard: { textAlign: 'center', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '20px', transition: 'transform 0.3s' },
  statNumber: { fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 900, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' },
  statLabel: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' },
  sectionTag: { display: 'inline-block', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)', color: 'var(--badge-text)', borderRadius: '999px', padding: '4px 16px', fontSize: '12px', fontWeight: 600, marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, color: 'var(--text-primary)' },
  sectionSubtitle: { color: 'var(--text-secondary)', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: '600px', margin: '0 auto' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px, 3vw, 24px)' },
  featureCard: { background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: 'clamp(20px, 4vw, 32px)', transition: 'all 0.3s ease', cursor: 'default' },
  featureIcon: { fontSize: 'clamp(28px, 4vw, 36px)', marginBottom: '16px', display: 'block' },
  featureTitle: { fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' },
  featureDesc: { color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(16px, 3vw, 28px)' },
  courseCard: { background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: 'clamp(18px, 4vw, 28px)', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column', gap: '16px' },
  courseCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  courseIconBg: { width: '52px', height: '52px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', border: '1px solid var(--glass-border)' },
  courseBadge: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '999px', padding: '3px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' },
  courseTitle: { fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' },
  courseDesc: { color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px', flex: 1 },
  courseMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '16px 0', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)' },
  enrollBtn: { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'all 0.3s ease', border: 'none' },
  testimonialCard: { background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: 'clamp(20px, 4vw, 32px)', transition: 'all 0.3s ease', color: 'var(--text-primary)' },
  avatarCircle: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '2px solid var(--glass-border)', flexShrink: 0 },
  ctaBanner: { padding: 'clamp(50px, 10vw, 100px) 0', background: 'var(--glass-bg)', borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)' },
  footer: { padding: 'clamp(20px, 4vw, 32px) 0', borderTop: '1px solid var(--divider)' },
};

export default Home;
