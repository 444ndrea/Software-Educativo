import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Layers, BookOpen, PlusCircle, Settings, Loader2, CheckCircle, BarChart3, Download, HelpCircle } from 'lucide-react';
import ModalReporte from './ModalReporte';
import { precisionColor } from '../utils/precisionColor';

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  score?: number; // Opcional, será calculado si no existe
}

interface Section {
  id: string;
  name: string;
  autor?: string;
  flashcardsCount: number;
  createdAt: string;
}

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    studentsCount: 0,
    students: [] as Student[],
    flashcardsCount: 0,
    sections: [] as Section[]
  });
  const [loading, setLoading] = useState(true);

  // Formulario Manual states
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState('');
  const [manualCards, setManualCards] = useState([{ pregunta: '', respuesta: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Report Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();

        setDashboardData({
          studentsCount: data.studentsCount,
          students: data.students,
          flashcardsCount: data.flashcardsCount,
          sections: data.sections
        });
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (student: Student) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/export/student/${student.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // The server provides a filename via Content-Disposition but setting it here is safe too
        a.download = `Reporte_${student.name.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar los datos');
      }
    } catch (error) {
      console.error('Download failed', error);
      alert('Error de red al intentar descargar');
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

  const handleAddCard = () => {
    setManualCards([...manualCards, { pregunta: '', respuesta: '' }]);
  };

  const handleCardChange = (index: number, field: 'pregunta' | 'respuesta', value: string) => {
    const newCards = [...manualCards];
    newCards[index][field] = value;
    setManualCards(newCards);
  };

  const handleRemoveCard = (index: number) => {
    const newCards = manualCards.filter((_, i) => i !== index);
    setManualCards(newCards);
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const validCards = manualCards.filter(c => c.pregunta.trim() && c.respuesta.trim());

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/mazos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: topic, cards: validCards })
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTopic('');
        setManualCards([{ pregunta: '', respuesta: '' }]);
        fetchDashboardData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'Desconocido'}`);
      }
    } catch (err) {
      console.error('Error en la petición:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6 md:p-12 font-sans text-gray-900">
      {/* Navbar / Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center z-10">
            <img
              src="/logo-sinfondo.png"
              alt="MemorIA Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Panel del Profesor
            </h1>
            <p className="text-gray-500 font-medium mt-1">Visión global y gestión de contenido.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/support')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Soporte y Ayuda</span>
          </button>
          <button
            onClick={() => alert('Abriendo panel de configuración...')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configuración</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Alumnos Activos */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">Alumnos Activos</p>
                  <p className="text-3xl font-bold">{dashboardData.studentsCount}</p>
                </div>
              </div>

              {/* Mazos Oficiales */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl">
                  <Layers className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">Mazos Oficiales</p>
                  {/* Now using officialSectionsCount if we passed it or just count from sections */}
                  <p className="text-3xl font-bold">{(dashboardData as any).officialSectionsCount || dashboardData.sections.length}</p>
                </div>
              </div>

              {/* Total Flashcards */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">Total Flashcards</p>
                  <p className="text-3xl font-bold">{dashboardData.flashcardsCount}</p>
                </div>
              </div>
            </div>

            {/* Generador Manual */}
            {showGenerator && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-10 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Crear Nuevo Mazo
                  </h2>
                  <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-600 font-semibold px-4 py-2 bg-gray-50 rounded-lg">
                    Cancelar
                  </button>
                </div>

                {!submitSuccess ? (
                  <form onSubmit={handleSubmitManual} className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Título del Tema</label>
                      <input
                        type="text"
                        placeholder="Ej. Introducción a la Biología"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-5 py-4 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Tarjetas (Pregunta / Respuesta)</label>
                      {manualCards.map((card, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-3 mb-3">
                          <input
                            type="text"
                            placeholder="Pregunta"
                            value={card.pregunta}
                            onChange={(e) => handleCardChange(index, 'pregunta', e.target.value)}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] shadow-sm"
                          />
                          <input
                            type="text"
                            placeholder="Respuesta"
                            value={card.respuesta}
                            onChange={(e) => handleCardChange(index, 'respuesta', e.target.value)}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] shadow-sm"
                          />
                          {manualCards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCard(index)}
                              disabled={isSubmitting}
                              className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors whitespace-nowrap"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddCard}
                        disabled={isSubmitting}
                        className="mt-2 text-[#1E3A8A] font-medium text-sm hover:underline"
                      >
                        + Añadir tarjeta
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-right">
                      <button
                        type="submit"
                        disabled={isSubmitting || !topic.trim()}
                        className="bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-transform active:scale-95 inline-flex items-center gap-2"
                      >
                        {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5" /> Guardando...</> : 'Guardar Mazo'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-green-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <h3 className="text-xl font-bold text-green-900">¡Mazo creado con éxito!</h3>
                    <button onClick={() => setSubmitSuccess(false)} className="text-green-700 bg-white border border-green-200 px-4 py-2 mt-2 rounded-lg font-medium shadow-sm hover:bg-green-50">
                      Crear otro mazo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Temas Oficiales Tabla */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-10 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Catálogo de Temas
                </h2>
                <button
                  onClick={() => setShowGenerator(!showGenerator)}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Nuevo Tema
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="pb-4 font-semibold w-1/3">Tema</th>
                      <th className="pb-4 font-semibold">Tarjetas</th>
                      <th className="pb-4 font-semibold">Fecha de Creación</th>
                      <th className="pb-4 font-semibold">Autor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {dashboardData.sections.length > 0 ? (
                      dashboardData.sections.map((section) => (
                        <tr key={section.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 font-semibold text-gray-900">{section.name}</td>
                          <td className="py-4 text-gray-600">{section.flashcardsCount}</td>
                          <td className="py-4 text-gray-500">
                            {new Date(section.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                              {section.autor || 'Profesor'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-500">No hay temas disponibles.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alumnos Tabla */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Rendimiento del Estudiantado
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="pb-4 font-semibold w-1/4">Alumno</th>
                      <th className="pb-4 font-semibold w-1/4">Email</th>
                      <th className="pb-4 font-semibold">Rendimiento Estimado</th>
                      <th className="pb-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {dashboardData.students.length > 0 ? (
                      dashboardData.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 font-semibold text-gray-900">{student.name}</td>
                          <td className="py-4 text-gray-500">{student.email}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-10 font-bold text-gray-700 text-right">{student.score}%</span>
                              <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${precisionColor(student.score)}`}
                                  style={{ width: `${student.score || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setIsModalOpen(true);
                                }}
                                className="text-white bg-[#1E3A8A] hover:bg-[#172554] p-2 rounded-lg transition-colors"
                                title="Ver Estadísticas"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(student)}
                                className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                title="Descargar Ficha"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-500">No hay alumnos inscritos.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <ModalReporte
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        sections={dashboardData.sections}
      />
    </div>
  );
};

export default TeacherDashboard;
