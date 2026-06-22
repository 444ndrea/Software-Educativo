import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ArrowLeft, BookOpen, Layers, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    question: '¿Cómo generar un mazo con IA?',
    answer: 'Ve a tu panel de estudiante o profesor, localiza el formulario "Generar Mazo con IA", escribe el tema deseado (por ejemplo, "Mitología Griega") y haz clic en el botón. En segundos tendrás un mazo listo para estudiar.'
  },
  {
    question: '¿Cómo funciona el algoritmo de repetición espaciada (SRS)?',
    answer: 'Nuestra plataforma utiliza el algoritmo SM-2. Cuando estudias una tarjeta, la evalúas como Fácil, Bien o Difícil. Según tu respuesta, calculamos el intervalo óptimo para mostrártela de nuevo justo antes de que la olvides, optimizando tu retención a largo plazo.'
  },
  {
    question: '¿Cómo exportar mis reportes de estudio?',
    answer: 'Si tienes rol de Profesor, entra a tu Dashboard, localiza la tabla de alumnos y haz clic en el botón de descarga rojo (CSV) junto al alumno deseado. Esto descargará automáticamente todas sus métricas y tiempos de estudio compatibles con Excel en español.'
  }
];

const TABS = [
  { id: 'inicio', label: 'Guía de Inicio', icon: BookOpen },
  { id: 'mazos', label: 'Gestión de Mazos', icon: Layers },
  { id: 'problemas', label: 'Solución de Problemas', icon: AlertCircle }
];

const MANUAL_CONTENT: Record<string, { title: string; content: string[] }> = {
  inicio: {
    title: 'Guía Rápida de Inicio',
    content: [
      '1. Inicia sesión con tu cuenta de Estudiante o Profesor.',
      '2. Si eres estudiante, revisa tu "Objetivo del Día" en la pantalla principal.',
      '3. Haz clic en "Estudiar Ahora" para comenzar tu primera sesión de repaso.',
      '4. Utiliza los botones Fácil, Bien y Difícil con honestidad para que el algoritmo funcione mejor.'
    ]
  },
  mazos: {
    title: 'Creación y Gestión de Mazos',
    content: [
      '1. Puedes usar la IA para crear mazos automáticos si te quedas sin ideas.',
      '2. Los profesores pueden crear "Mazos Oficiales" que aparecerán en la cuenta de sus alumnos.',
      '3. Un mazo "completo" es aquel que no tiene tarjetas pendientes de repaso para hoy.',
      '4. Siempre puedes usar la opción "Volver a Repasar" (Modo Libre) en un mazo que ya completaste.'
    ]
  },
  problemas: {
    title: 'Solución de Errores Comunes',
    content: [
      '1. ¿El mazo IA falla?: Verifica que hayas introducido un tema válido y que el servidor tenga conexión.',
      '2. ¿No ves tu reporte?: Asegúrate de haber completado al menos una sesión de estudio para generar progreso.',
      '3. ¿La pantalla de "Al día" se queda pegada?: Revisa que tu dispositivo tenga la fecha y hora correctas.',
      '4. Si los problemas persisten, contacta al administrador de MemoriA.'
    ]
  }
};

const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-slate-800 pb-12">
      {/* Navbar Minimalista */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-xl hover:bg-slate-100 active:scale-95 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#1E3A8A] flex items-center gap-2">
              <HelpCircle className="w-6 h-6" /> Centro de Soporte
            </h1>
          </div>
          <img src="/logo-sinfondo.png" alt="MemorIA Logo" className="h-10 w-auto object-contain opacity-80" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Cabecera y Buscador */}
        <section className="bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4 tracking-tight">¿Cómo podemos ayudarte hoy?</h2>
            <p className="text-blue-100 mb-8 text-lg">Busca respuestas rápidas a tus dudas o navega por nuestro manual interactivo.</p>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                placeholder="Busca por palabra clave (ej. 'IA', 'CSV', 'Exportar')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all font-medium shadow-sm"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQ Accordion */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              Preguntas Frecuentes
            </h3>
            
            {filteredFaqs.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="group">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none"
                      >
                        <span className={`font-semibold text-base transition-colors ${isOpen ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-700'}`}>
                          {faq.question}
                        </span>
                        <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-400 group-hover:text-blue-600'}`}>
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed bg-slate-50/50">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center flex flex-col items-center">
                <Search className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No se encontraron resultados para "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-600 font-bold hover:underline">Limpiar búsqueda</button>
              </div>
            )}
          </section>

          {/* Manual Interactivo */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Manual Interactivo
            </h3>
            
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-2 flex flex-col">
              {/* Tabs Navbar */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 gap-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2.5 px-2 flex flex-col items-center gap-1.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-white shadow-sm text-blue-700 scale-100 font-bold' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95 font-medium'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'opacity-70'}`} />
                      <span className="text-[10px] sm:text-xs text-center leading-none">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-4 bg-slate-50/80 rounded-2xl flex-1 border border-slate-100/50">
                <h4 className="font-bold text-slate-800 text-lg mb-4 text-center">
                  {MANUAL_CONTENT[activeTab].title}
                </h4>
                <div className="space-y-3">
                  {MANUAL_CONTENT[activeTab].content.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-snug">
                        {step.substring(3)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default SupportCenter;
