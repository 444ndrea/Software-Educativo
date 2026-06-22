import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import SupportCenter from './components/SupportCenter';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/study/:sectionId" element={<StudySession />} />
        <Route path="/support" element={<SupportCenter />} />
      </Routes>
    </Router>
  );
}

export default App;
