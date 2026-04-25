import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

/* ── Tab definitions ── */
const TABS = [
  { id: 'overview',    label: '📊 Overview',      title: 'Platform Overview' },
  { id: 'courses',     label: '📚 Courses',        title: 'Course Management' },
  { id: 'users',       label: '👥 Users',          title: 'User Management' },
  { id: 'enrollments', label: '🎓 Enrollments',    title: 'Enrollment Records' },
];

/* ── Stat card ── */
const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.25s' }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ fontSize: '32px' }}>{icon}</div>
    <div style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: color || 'var(--accent-color)' }}>{value}</div>
    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{label}</div>
    {sub && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sub}</div>}
  </div>
);

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const map = {
    APPROVED: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)', label: '✓ Approved' },
    PENDING:  { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', border: 'rgba(234,179,8,0.3)',  label: '⏳ Pending' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)', label: '✕ Rejected' },
  };
  const s = map[status] || map.PENDING;
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 700 }}>{s.label}</span>;
};

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
  const colors = {
    ROLE_ADMIN:      { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    ROLE_INSTRUCTOR: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    ROLE_STUDENT:    { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  };
  const c = colors[role] || colors.ROLE_STUDENT;
  const display = role.replace('ROLE_', '');
  return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, marginRight: '4px' }}>{display}</span>;
};

/* ══════════════════════════════════════════
   MAIN ADMIN DASHBOARD
══════════════════════════════════════════ */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses]         = useState([]);
  const [users, setUsers]             = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [search, setSearch]           = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes, eRes, sRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/users'),
        api.get('/admin/enrollments'),
        api.get('/admin/stats'),
      ]);
      setCourses(cRes.data.data || []);
      setUsers(uRes.data.data || []);
      setEnrollments(eRes.data.data || []);
      setStats(sRes.data.data || null);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id, isApproved) => {
    try {
      await api.put(`/admin/courses/${id}/approve?isApproved=${isApproved}`);
      showToast(isApproved ? '✅ Course approved!' : '❌ Course rejected');
      fetchAll();
    } catch { showToast('Action failed', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showToast('👤 User deleted successfully');
      setConfirmDelete(null);
      fetchAll();
    } catch { showToast('Delete failed', 'error'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e =>
    e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    e.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorName?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Styles ── */
  const S = {
    container: { minHeight: '100vh', padding: '0' },
    header: { padding: 'clamp(16px, 3vw, 28px) clamp(16px, 4vw, 32px)', background: 'var(--glass-bg)', borderBottom: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: '20px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, margin: 0, color: 'var(--text-primary)' },
    tabBar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tab: (active) => ({ padding: '8px 18px', borderRadius: '10px', border: `1px solid ${active ? 'var(--accent-color)' : 'var(--glass-border)'}`, background: active ? 'var(--accent-color)' : 'transparent', color: active ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }),
    content: { padding: 'clamp(16px, 3vw, 32px)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: '32px' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--divider)', background: 'var(--glass-bg)' },
    td: { padding: '14px 16px', fontSize: '14px', borderBottom: '1px solid var(--divider)', color: 'var(--text-primary)', verticalAlign: 'middle' },
    tableWrap: { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'auto', marginTop: '20px' },
    searchBar: { width: '100%', maxWidth: '360px', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', marginBottom: '0' },
    actionBtnGreen: { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
    actionBtnRed: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' },
  };

  if (loading && !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '18px', color: 'var(--text-secondary)' }}>⏳ Loading dashboard...</div>;
  }

  return (
    <div style={S.container}>

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)', color: '#fff', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', animation: 'fadeInUp 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Delete User?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              This action cannot be undone. All data for <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete.name}</strong> will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...S.actionBtnGreen, padding: '10px 24px' }}>Cancel</button>
              <button onClick={() => handleDeleteUser(confirmDelete.id)} style={{ ...S.actionBtnRed, padding: '10px 24px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <div>
            <h1 style={S.title}>🛡️ Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0' }}>Full platform control panel</p>
          </div>
          <button onClick={fetchAll} style={{ ...S.actionBtnGreen, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔄 Refresh
          </button>
        </div>
        <div style={S.tabBar}>
          {TABS.map(t => (
            <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => { setActiveTab(t.id); setSearch(''); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={S.content}>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && stats && (
          <div>
            <div style={S.statsGrid}>
              <StatCard icon="👥" label="Total Users" value={stats.totalUsers} sub="Registered accounts" color="#60a5fa" />
              <StatCard icon="📚" label="Total Courses" value={stats.totalCourses} sub={`${stats.approvedCourses} approved`} color="#a78bfa" />
              <StatCard icon="🎓" label="Enrollments" value={stats.totalEnrollments} sub="Active enrollments" color="#34d399" />
              <StatCard icon="⏳" label="Pending Review" value={stats.pendingCourses} sub="Awaiting approval" color="#eab308" />
              <StatCard icon="❌" label="Rejected" value={stats.rejectedCourses} sub="Courses rejected" color="#f87171" />
              <StatCard icon="💰" label="Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} sub="Total platform revenue" color="#4ade80" />
            </div>

            {/* Recent courses needing review */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>⏳ Pending Approvals</h2>
            {courses.filter(c => c.status === 'PENDING').length === 0
              ? <div style={{ color: 'var(--text-secondary)', padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', textAlign: 'center' }}>✅ No pending courses — all caught up!</div>
              : courses.filter(c => c.status === 'PENDING').map(c => (
                <div key={c.id} style={{ background: 'var(--glass-bg)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '14px', padding: '16px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>by {c.instructorName} • ₹{c.price}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={S.actionBtnGreen} onClick={() => handleApprove(c.id, true)}>✓ Approve</button>
                    <button style={S.actionBtnRed} onClick={() => handleApprove(c.id, false)}>✕ Reject</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ══ COURSES TAB ══ */}
        {activeTab === 'courses' && (
          <div>
            <div style={S.sectionHeader}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>All Courses ({filteredCourses.length})</h2>
              </div>
              <input style={S.searchBar} placeholder="🔍 Search by title or instructor..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Course</th>
                    <th style={S.th}>Instructor</th>
                    <th style={S.th}>Price</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(c => (
                    <tr key={c.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={S.td}><span style={{ fontWeight: 600 }}>{c.title}</span></td>
                      <td style={S.td}>{c.instructorName}</td>
                      <td style={S.td}>₹{c.price}</td>
                      <td style={S.td}><StatusBadge status={c.status} /></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={S.actionBtnGreen} onClick={() => handleApprove(c.id, true)}>Approve</button>
                          <button style={S.actionBtnRed} onClick={() => handleApprove(c.id, false)}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === 'users' && (
          <div>
            <div style={S.sectionHeader}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>All Users ({filteredUsers.length})</h2>
              <input style={S.searchBar} placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Name</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Roles</th>
                    <th style={S.th}>Joined</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...S.td, color: 'var(--text-secondary)', fontSize: '13px' }}>{i + 1}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={S.td}>{u.roles?.map(r => <RoleBadge key={r} role={r} />)}</td>
                      <td style={{ ...S.td, color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={S.td}>
                        {!u.roles?.includes('ROLE_ADMIN') && (
                          <button style={S.actionBtnRed} onClick={() => setConfirmDelete(u)}>🗑 Delete</button>
                        )}
                        {u.roles?.includes('ROLE_ADMIN') && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ENROLLMENTS TAB ══ */}
        {activeTab === 'enrollments' && (
          <div>
            <div style={S.sectionHeader}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>All Enrollments ({filteredEnrollments.length})</h2>
              <input style={S.searchBar} placeholder="🔍 Search by student or course..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Student</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Course</th>
                    <th style={S.th}>Progress</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((e, i) => (
                    <tr key={e.enrollmentId}
                      onMouseEnter={ev => ev.currentTarget.style.background = 'var(--card-hover-bg)'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...S.td, color: 'var(--text-secondary)', fontSize: '13px' }}>{i + 1}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{e.studentName}</td>
                      <td style={{ ...S.td, color: 'var(--text-secondary)' }}>{e.studentEmail}</td>
                      <td style={S.td}>{e.courseTitle}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--divider)', borderRadius: '999px', overflow: 'hidden', minWidth: '80px' }}>
                            <div style={{ height: '100%', width: `${e.progress || 0}%`, background: e.progress >= 100 ? '#22c55e' : '#3b82f6', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '36px' }}>{Math.round(e.progress || 0)}%</span>
                        </div>
                      </td>
                      <td style={S.td}>
                        {e.completed
                          ? <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '13px' }}>✅ Completed</span>
                          : <span style={{ color: '#eab308', fontWeight: 700, fontSize: '13px' }}>📖 In Progress</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
