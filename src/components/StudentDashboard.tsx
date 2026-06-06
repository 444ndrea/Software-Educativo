import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, CheckCircle, LogOut, Flame, Book, Calendar, PlayCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Deck {
  id: string;
  name: string;
  totalCards: number;
  lastStudied?: string;
}

interface DashboardData {
  currentStreak: number;
  recentDecks: Deck[];
}

const StudentDashboard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastGeneratedId, setLastGeneratedId] = useState('all');
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentStreak: 0,
    recentDecks: []
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Valor demostrativo de "Objetivo del Día"
  const [dailyProgress, setDailyProgress] = useState(65);

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
          setDashboardData(data);

          if (data.currentStreak > 0) {
            triggerConfetti();
            setDailyProgress(100);
          }
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
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const interval = setInterval(function () {
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

  const handleGenerate = async (e: React.FormEvent) => {
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
        triggerConfetti();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Error desconocido generando tarjetas'}`);
      }
    } catch (err) {
      console.error('Error en la petición:', err);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1E3A8A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6 md:p-12 font-sans text-gray-900">
      {/* Navbar / Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <img src="/logo-sinfondo.png" alt="MemorIA Logo" className="w-16 h-16 object-contain mr-3" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Aprendizaje</h1>
            <p className="text-gray-500 font-medium mt-1">Sigue tu progreso y domina nuevos temas.</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-semibold transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Estadísticas y Generador */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Card Objetivo del Día (New Apple Style Request) */}
          <div className="bg-[#1E3A8A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Flame className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Objetivo del Día</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold">{dailyProgress}%</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Flame className={`w-8 h-8 ${dailyProgress >= 100 ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-white'}`} />
                </div>
              </div>

              {/* Thick & Fluid Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${dailyProgress}%` }}
                ></div>
              </div>

              <p className="text-sm text-white/90 font-medium">
                {dailyProgress >= 100 ? '¡Objetivo completado! Eres imparable 🔥' : '¡Sigue estudiando para mantener la racha!'}
              </p>
            </div>
          </div>

          {/* Generador de IA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              Generar Mazo (IA)
            </h2>

            {!success ? (
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div>
                  <input
                    id="topic"
                    type="text"
                    placeholder="Ej. Anatomía Humana..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all disabled:opacity-50 text-gray-900 font-medium shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full bg-[#1E3A8A] hover:bg-[#172554] disabled:bg-blue-200 text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-transform active:scale-95 flex justify-center items-center gap-2 group"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin w-5 h-5" /> <span>Analizando...</span></>
                  ) : (
                    <><PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span>Crear Flashcards</span></>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in">
                <div className="bg-green-50 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">¡Tarjetas listas!</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">IA ha generado contenido experto exitosamente.</p>
                </div>
                <button
                  onClick={() => navigate(`/study/${lastGeneratedId}`)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <PlayCircle className="w-5 h-5" /> Iniciar Sesión de Estudio
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors mt-1"
                >
                  Generar otro mazo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Historial de Mazos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Book className="w-6 h-6" />
                </div>
                Tus Mazos
              </h2>
              <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold">
                {dashboardData.recentDecks.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dashboardData.recentDecks.length > 0 ? (
                dashboardData.recentDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => navigate(`/study/${deck.id}`)}
                    className="group border border-gray-100 bg-white hover:bg-[#F9FAFB] hover:border-gray-200 shadow-sm hover:shadow-md rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 truncate group-hover:text-[#1E3A8A] transition-colors">
                      {deck.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs px-3 py-1.5 rounded-lg font-bold">
                        {deck.totalCards} tarjetas
                      </span>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {deck.lastStudied
                          ? new Date(deck.lastStudied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'Nunca'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-50 p-5 rounded-full mb-4">
                    <Book className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">Aún no tienes mazos.</p>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Usa la IA a la izquierda para generar contenido y empezar a estudiar.</p>
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
