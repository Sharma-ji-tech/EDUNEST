import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ThemeProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import InstructorCourseEdit from './pages/Dashboard/InstructorCourseEdit';
import CourseDetail from './pages/CourseDetail';
import Learn from './pages/Learn';
import Navbar from './components/Navbar';
import './index.css';

const ProtectedRoute = ({ children, role }) => {
  const { user, token, loading, hasRole } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user || !token) return <Navigate to="/login" />;
  if (role && !hasRole(role)) return <Navigate to="/" />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses/:id" element={<CourseDetail />} />

            <Route path="/student/dashboard" element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/learn/:courseId" element={
              <ProtectedRoute role="STUDENT">
                <Learn />
              </ProtectedRoute>
            } />

            <Route path="/instructor/dashboard" element={
              <ProtectedRoute role="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            } />

            <Route path="/instructor/courses/:id/edit" element={
              <ProtectedRoute role="INSTRUCTOR">
                <InstructorCourseEdit />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
