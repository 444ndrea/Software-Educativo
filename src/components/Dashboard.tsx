import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
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
      navigate('/student');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center font-sans tracking-tight">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1E3A8A] mb-4"></div>
      <p className="text-gray-900 font-bold text-lg">Iniciando sesión segura...</p>
      <p className="text-gray-500 font-medium">Validando credenciales y preparando el entorno</p>
    </div>
  );
};

export default Dashboard;
