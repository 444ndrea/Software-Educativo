import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, CheckCircle, LogOut, Flame, Book, Calendar, PlayCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const StudentDashboard = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastGeneratedId, setLastGeneratedId] = useState('all');
  const navigate = useNavigate();

  // Dashboard Stats
  const [dashboardData, setDashboardData] = useState({
    currentStreak: 0,
    recentDecks: []
  });
  const [dataLoading, setDataLoading] = useState(true);
  
  const previousStreakRef = useRef(0);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'student') {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('http://localhost:3001/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          
          // Confetti logic if streak increased
          if (data.currentStreak > previousStreakRef.current && previousStreakRef.current > 0) {
            triggerConfetti();
          }
          previousStreakRef.current = data.currentStreak;
          
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token') || '';
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        alert('Sesión inválida. Por favor, inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/api/ai/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, userId })
      });

      if (res.ok) {
        const resData = await res.json();
        const generatedId = (resData.data && resData.data.length > 0) ? resData.data[0].id : encodeURIComponent(topic);
        setLastGeneratedId(generatedId);
        setSuccess(true);
        setTopic('');
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error desconocido generando tarjetas';
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error en la petición:', err);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative overflow-hidden">
      {/* Navbar / Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Aprendizaje</h1>
          <p className="text-gray-500 mt-1">Sigue tu progreso y domina nuevos temas.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Estadísticas y Generador */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Tarjeta de Racha */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transform transition hover:scale-105 duration-300">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Flame className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Flame className={`w-8 h-8 ${dashboardData.currentStreak > 0 ? 'text-yellow-300 animate-pulse' : 'text-white'}`} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Racha Actual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{dashboardData.currentStreak}</span>
                  <span className="text-lg font-medium text-white/90">días</span>
                </div>
              </div>
            </div>
            {dashboardData.currentStreak > 0 ? (
              <p className="mt-4 text-sm text-white/90 font-medium">¡Estás on fire! Sigue así 🔥</p>
            ) : (
              <p className="mt-4 text-sm text-white/90 font-medium">Estudia hoy para iniciar tu racha</p>
            )}
          </div>

          {/* Generador de IA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <PlusCircle className="w-5 h-5" />
              </span>
              Nuevo Tema
            </h2>
            
            {!success ? (
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div>
                  <input
                    id="topic"
                    type="text"
                    placeholder="Ej. Redes de Computadoras..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    className="w-full px-5 py-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 text-gray-700"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Generando magia...</span>
                    </>
                  ) : (
                    <>
                      <span>Generar Flashcards</span>
                      <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800">¡Tarjetas listas!</h3>
                  <p className="text-sm text-gray-500 mt-1">Tu mazo ha sido generado por IA.</p>
                </div>
                <button
                  onClick={() => navigate(`/study/${lastGeneratedId}`)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Empezar a Estudiar
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
                >
                  Generar otro tema
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Historial de Mazos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Book className="w-6 h-6 text-indigo-500" />
                Tus Mazos
              </h2>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                {dashboardData.recentDecks.length} Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.recentDecks.length > 0 ? (
                dashboardData.recentDecks.map((deck) => (
                  <div 
                    key={deck.id} 
                    onClick={() => navigate(`/study/${deck.id}`)}
                    className="group border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all duration-200"
                  >
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-2 truncate">
                      {deck.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md font-semibold">
                        {deck.totalCards} tarjetas
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {deck.lastStudied 
                          ? new Date(deck.lastStudied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                          : 'Nunca'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Book className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aún no tienes mazos generados.</p>
                  <p className="text-gray-400 text-sm mt-1">Usa la IA a la izquierda para empezar a estudiar.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
