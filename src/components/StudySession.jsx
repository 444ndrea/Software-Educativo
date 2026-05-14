import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const StudySession = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  
  // Timer states
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const url = sectionId && sectionId !== 'all' 
          ? `http://localhost:3001/api/reviews/due?sectionId=${sectionId}`
          : `http://localhost:3001/api/reviews/due`;

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCards(data);
          setStartTime(Date.now());
        }
      } catch (error) {
        console.error('Error al cargar tarjetas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [sectionId]);

  useEffect(() => {
    if (loading || cards.length === 0 || currentIndex >= cards.length) return;
    
    const intervalId = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loading, cards.length, currentIndex, startTime]);

  const currentCard = cards[currentIndex];

  const handleRate = async (quality) => {
    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`http://localhost:3001/api/reviews/${currentCard.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quality, tiempo_empleado: elapsed })
      });
      
      setIsFlipped(false);
      
      setTimeout(() => {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
        setElapsed(0);
      }, 300);
      
    } catch (error) {
      console.error('Error al calificar tarjeta:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full"
        >
          <div className="bg-green-100 p-6 rounded-full mb-6 shadow-inner">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-2">¡Todo al día!</h2>
          <p className="text-gray-500 text-center mb-8">Has completado todas las tarjetas pendientes de esta sección.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 active:scale-95"
          >
            Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  const ratingButtons = [
    { value: 0, label: '0', color: 'bg-red-500 hover:bg-red-600 shadow-red-200' },
    { value: 1, label: '1', color: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' },
    { value: 2, label: '2', color: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200' },
    { value: 3, label: '3', color: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' },
    { value: 4, label: '4', color: 'bg-green-400 hover:bg-green-500 shadow-green-200' },
    { value: 5, label: '5', color: 'bg-green-600 hover:bg-green-700 shadow-green-200' },
  ];

  // Configuración del Timer Horizontal (Progress Bar)
  const maxTime = 30; // 30 segundos límite sugerido
  const progressPercentage = Math.min((elapsed / maxTime) * 100, 100);
  const barColor = elapsed > 20 ? 'bg-red-500' : elapsed > 10 ? 'bg-yellow-500' : 'bg-indigo-500';

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 px-4 py-8 relative">
      
      {/* Top Header & Progress Bar Timer */}
      <div className="w-full max-w-2xl mx-auto mb-8 bg-white p-5 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <Book className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-700">Tarjeta {currentIndex + 1} <span className="text-gray-400 font-medium">de {cards.length}</span></span>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-lg text-gray-700 bg-gray-100 px-4 py-1.5 rounded-xl">
            <Clock className="w-5 h-5 text-gray-400" />
            {elapsed}s
          </div>
        </div>
        
        {/* Horizontal Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
          <motion.div 
            className={`h-full rounded-full transition-colors duration-500 ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl" style={{ perspective: '1000px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 * direction }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Contenedor de la tarjeta 3D */}
            <motion.div
              className="relative w-full h-96 rounded-[2.5rem] shadow-xl cursor-pointer transition-transform duration-500"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => !isFlipped && setIsFlipped(true)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Lado A (Frente) */}
              <div 
                className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-10 border border-gray-100 shadow-sm"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-8 bg-gray-100 px-4 py-1.5 rounded-full">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Pregunta</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 text-center leading-relaxed">{currentCard.side_a}</h3>
                {!isFlipped && (
                  <div className="absolute bottom-8 flex items-center gap-2 text-indigo-400 text-sm font-medium animate-bounce">
                    Haz clic para revelar
                  </div>
                )}
              </div>

              {/* Lado B (Atrás) */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2.5rem] flex flex-col items-center justify-center p-10 border border-indigo-100 shadow-inner"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)' 
                }}
              >
                <div className="absolute top-8 bg-indigo-100 px-4 py-1.5 rounded-full">
                  <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Respuesta</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 text-center leading-relaxed">{currentCard.side_b}</h3>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Sistema de Calificación */}
        <div className="h-40 mt-10 flex flex-col items-center w-full">
          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
              >
                <h4 className="text-center text-gray-800 mb-4 font-bold text-lg">¿Qué tan fácil fue recordar?</h4>
                <div className="flex justify-between gap-2 md:gap-4">
                  {ratingButtons.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(btn.value);
                      }}
                      className={`${btn.color} text-white font-black text-xl py-4 flex-1 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 flex justify-center`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
