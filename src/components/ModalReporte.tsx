import React, { useState, useEffect } from 'react';
import { Loader2, X, AlertTriangle, CheckCircle, BarChart3, Target } from 'lucide-react';

interface ModalReporteProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  sections: any[];
}

const ModalReporte: React.FC<ModalReporteProps> = ({ isOpen, onClose, student, sections }) => {
  const [selectedMazoId, setSelectedMazoId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentMazos, setStudentMazos] = useState<any[]>([]);
  const [loadingMazos, setLoadingMazos] = useState(false);

  useEffect(() => {
    if (!isOpen || !student) {
      setSelectedMazoId('');
      setReportData(null);
      setError('');
      setStudentMazos([]);
      return;
    }

    const fetchMazos = async () => {
      setLoadingMazos(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/api/mazos/estudiante/${student.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudentMazos(data);
        }
      } catch (err) {
        console.error('Error al obtener los mazos del estudiante:', err);
      } finally {
        setLoadingMazos(false);
      }
    };

    fetchMazos();
    setSelectedMazoId('');
    setReportData(null);
    setError('');
  }, [isOpen, student]);

  useEffect(() => {
    if (!selectedMazoId || !student) return;

    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/api/reportes/estudiante/${student.id}/mazo/${selectedMazoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener el reporte');
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        setError('No se pudo cargar el reporte analítico.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedMazoId, student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#1E3A8A] p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-200" />
              Reporte Analítico
            </h2>
            <p className="text-blue-100 mt-1 opacity-90 text-sm font-medium">
              Estudiante: {student?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#172554] rounded-full transition-colors active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#F5F5F7]">
          {/* Selector de Mazo */}
          <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">Mazo a Evaluar:</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] outline-none transition-all text-gray-700 font-medium"
              value={selectedMazoId}
              onChange={(e) => setSelectedMazoId(e.target.value)}
              disabled={loadingMazos}
            >
              <option value="">{loadingMazos ? 'Cargando mazos...' : '-- Elige un Mazo --'}</option>
              {studentMazos.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.autor})</option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-[#1E3A8A] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Calculando métricas del estudiante...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold border border-red-100 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !reportData && !error && selectedMazoId && (
             <div className="text-center py-12 text-gray-400 font-medium font-mono text-sm uppercase tracking-widest">
               Procesando Datos...
             </div>
          )}

          {!loading && reportData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Progreso y Rendimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Progreso
                  </h3>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-black text-gray-900">{reportData.progreso.consolidadas}</span>
                    <span className="text-gray-400 font-semibold mb-1">/ {reportData.progreso.totales} completadas</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${reportData.progreso.totales > 0 ? (reportData.progreso.consolidadas / reportData.progreso.totales) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <Target className="w-24 h-24" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 relative z-10">
                    <Target className="w-4 h-4 text-[#1E3A8A]" />
                    Tasa de Acierto
                  </h3>
                  <div className="flex items-end gap-2 relative z-10">
                    <span className="text-4xl font-black text-[#1E3A8A]">{reportData.rendimiento.tasaAcierto}%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-medium relative z-10">Constancia: {reportData.rendimiento.constancia}%</p>
                </div>
              </div>

              {/* Alertas Pedagógicas */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alertas Pedagógicas
                </h3>
                {reportData.alertas && reportData.alertas.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.alertas.map((alerta: any, idx: number) => (
                      <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start transition-colors">
                        <div className="bg-red-100 text-red-600 p-2 rounded-xl shrink-0">
                          <X className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-red-900 font-bold">{alerta.pregunta}</p>
                          <p className="text-red-600 text-sm mt-1 font-medium">Factor de retención crítico: {alerta.easiness_factor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-700 p-5 rounded-2xl text-center border border-green-100">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-bold">El estudiante no registra tarjetas críticas.</p>
                    <p className="text-sm mt-1 opacity-80 font-medium">Demuestra excelente desempeño y asimilación de conceptos.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalReporte;
