import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      navigate('/login');
      return;
    }

    if (role === 'teacher') {
      navigate('/teacher');
    } else {
      // Por defecto o si es student, al panel de estudiante
      navigate('/student');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-500 font-medium">Cargando tu panel de control...</p>
    </div>
  );
};

export default Dashboard;
