import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Layers, BookOpen, PlusCircle, LayoutDashboard, Settings, Loader2, CheckCircle } from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    studentsCount: 0,
    flashcardsCount: 0,
    sections: []
  });
  const [loading, setLoading] = useState(true);

  // Formulario IA states
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch admin stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'teacher') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setAiLoading(true);
    setAiSuccess(false);

    try {
      const token = localStorage.getItem('token') || '';
      const userId = localStorage.getItem('userId');
      
      const res = await fetch('http://localhost:3001/api/ai/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, userId })
      });

      if (res.ok) {
        setAiSuccess(true);
        setTopic('');
        // Recargar las estadísticas para mostrar el nuevo mazo
        fetchDashboardData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Desconocido'}`);
      }
    } catch (err) {
      console.error('Error en la petición:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative overflow-hidden">
      {/* Navbar / Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            Panel del Profesor
          </h1>
          <p className="text-gray-500 mt-1">Visión global y gestión de contenido educativo.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hidden sm:flex">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configuración</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 flex items-center gap-6">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-inner shadow-blue-200">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Alumnos Activos</p>
                  <p className="text-3xl font-black text-gray-800">{dashboardData.studentsCount}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 flex items-center gap-6">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-inner shadow-green-200">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Mazos Oficiales</p>
                  <p className="text-3xl font-black text-gray-800">{dashboardData.sections.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 flex items-center gap-6">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-2xl shadow-inner shadow-purple-200">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Flashcards</p>
                  <p className="text-3xl font-black text-gray-800">{dashboardData.flashcardsCount}</p>
                </div>
              </div>
            </div>

            {/* Generador IA (Solo visible si showGenerator es true) */}
            {showGenerator && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl shadow-sm border border-indigo-100 p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-white p-2 rounded-lg text-indigo-600 shadow-sm">
                      <PlusCircle className="w-5 h-5" />
                    </span>
                    Generar Nuevo Mazo
                  </h2>
                  <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-600 font-medium text-sm">
                    Cancelar
                  </button>
                </div>

                {!aiSuccess ? (
                  <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Ej. Historia de la Computación"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={aiLoading}
                      className="flex-1 px-5 py-4 bg-white rounded-xl border border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !topic.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          <span>Generando...</span>
                        </>
                      ) : (
                        <>
                          <span>Crear Mazo</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-4 bg-green-100 p-4 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-green-800">¡Mazo generado con éxito!</p>
                      <p className="text-sm text-green-700">Las tarjetas se han guardado en la base de datos.</p>
                    </div>
                    <button onClick={() => setAiSuccess(false)} className="ml-auto text-green-600 hover:text-green-800 font-medium text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      Crear otro
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Layers className="w-5 h-5" />
                  </span>
                  Temas Oficiales
                </h2>
                <button 
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Crear Nuevo Tema
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-gray-500 font-bold uppercase tracking-wider text-xs">Tema</th>
                      <th className="py-4 px-6 text-gray-500 font-bold uppercase tracking-wider text-xs">Tarjetas</th>
                      <th className="py-4 px-6 text-gray-500 font-bold uppercase tracking-wider text-xs">Creado</th>
                      <th className="py-4 px-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.sections.length > 0 ? (
                      dashboardData.sections.map((section, index) => (
                        <tr 
                          key={section.id} 
                          className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${index === dashboardData.sections.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <td className="py-4 px-6 text-gray-800 font-bold">{section.name}</td>
                          <td className="py-4 px-6">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                              {section.flashcardsCount} tarjetas
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-500 font-medium">
                            {new Date(section.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold text-sm transition-colors">
                              Administrar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                              <Layers className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No hay temas creados todavía.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
