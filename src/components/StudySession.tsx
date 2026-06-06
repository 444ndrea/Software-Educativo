import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface Flashcard {
  id: string;
  side_a: string;
  side_b: string;
}

const StudySession: React.FC = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  
  // Timer states
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [freezeTime, setFreezeTime] = useState(false);

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
    if (loading || cards.length === 0 || currentIndex >= cards.length || freezeTime) return;
    
    const intervalId = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loading, cards.length, currentIndex, startTime, freezeTime]);

  // Completado
  useEffect(() => {
    if (!loading && cards.length > 0 && currentIndex >= cards.length) {
      triggerConfetti();
    }
  }, [currentIndex, cards.length, loading]);

  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1E3A8A', '#3B82F6', '#10B981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1E3A8A', '#3B82F6', '#10B981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleReveal = () => {
    if (isFlipped) return;
    setIsFlipped(true);
    setFreezeTime(true); // Congelar tiempo
  };

  const handleRate = async (quality: number) => {
    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`http://localhost:3001/api/reviews/${cards[currentIndex].id}`, {
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
        setFreezeTime(false); // Reactivar temporizador para la next card
      }, 300);
      
    } catch (error) {
      console.error('Error al calificar tarjeta:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F5F5F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1E3A8A]"></div>
      </div>
    );
  }

  // Session Completed state
  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7] p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white p-10 rounded-[2rem] shadow-xl flex flex-col items-center max-w-md w-full border border-gray-100 relative overflow-hidden"
        >
          {/* Fondo sutil decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>

          <div className="bg-green-100 p-5 rounded-[1.5rem] mb-6 inline-flex relative z-10">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-3">Sesión Completada</h2>
          <p className="text-gray-500 text-center mb-8 font-medium">¡Gran trabajo! Has repasado todo tu contenido pendiente para hoy.</p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-transform transform active:scale-[0.98]"
          >
            Volver al Panel
          </button>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const ratingButtons = [
    { value: 1, label: 'Difícil', sub: 'Repasar pronto', color: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500' },
    { value: 3, label: 'Bien', sub: 'En unos días', color: 'bg-blue-50 text-[#1E3A8A] border border-blue-100 hover:bg-blue-100 focus:ring-blue-500' },
    { value: 5, label: 'Fácil', sub: 'En una semana', color: 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 focus:ring-green-500' },
  ];

  const maxTime = 30; // Suggested time
  const progressPercentage = Math.min((elapsed / maxTime) * 100, 100);
  const barColor = elapsed > 20 ? 'bg-red-500' : elapsed > 10 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans">
      {/* Top Navbar */}
      <div className="w-full px-6 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold transition-colors bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Abandonar Sesión</span>
        </button>

        <img src="/logo-sinfondo.png" alt="MemorIA Logo" className="w-10 h-10 object-contain opacity-80" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-12 relative w-full max-w-2xl mx-auto">
        
        {/* Progress & Info */}
        <div className="w-full flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span>Tarjeta {currentIndex + 1}</span>
            <span className="text-gray-400">/ {cards.length}</span>
          </div>
          
          <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2 rounded-xl transition-colors ${freezeTime ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'}`}>
            <Clock className="w-5 h-5 opacity-70" />
            {elapsed}s
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner mb-8">
          <motion.div 
            className={`h-full rounded-full transition-colors duration-500 ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>

        {/* Flashcard Area */}
        <div className="w-full relative" style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 50 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 * direction }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <motion.div
                className="relative w-full h-[28rem] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 25 }}
                onClick={handleReveal}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Lado A (Pregunta) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-12 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <h3 className="text-3xl font-extrabold text-gray-900 text-center leading-relaxed font-sans">{currentCard.side_a}</h3>
                  {!isFlipped && (
                    <div className="absolute bottom-10 flex flex-col items-center text-gray-400 font-medium">
                      <span className="text-sm bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm animate-pulse">Hacer clic para revelar</span>
                    </div>
                  )}
                </div>

                {/* Lado B (Respuesta) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#1E3A8A] rounded-[2.5rem] flex flex-col items-center justify-center p-12 shadow-[inset_0_4px_20px_rgb(0,0,0,0.2)]"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  <div className="absolute top-8 bg-blue-900/40 text-blue-100 px-4 py-1.5 rounded-full backdrop-blur-sm border border-blue-800">
                    <span className="text-xs font-bold uppercase tracking-widest">Respuesta</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white text-center leading-relaxed drop-shadow-md">{currentCard.side_b}</h3>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sistema de Calificación */}
        <div className="h-32 mt-8 w-full flex justify-center">
          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="w-full flex gap-4 mt-2"
              >
                {ratingButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRate(btn.value);
                    }}
                    className={`flex-1 flex flex-col justify-center items-center py-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.96] outline-none focus:ring-2 focus:ring-opacity-50 ${btn.color}`}
                  >
                    <span className="font-bold text-xl">{btn.label}</span>
                    <span className="text-xs font-medium opacity-80 mt-1">{btn.sub}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default StudySession;
