import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, PlusCircle, CheckCircle, LogOut, Flame, Book,
  PlayCircle, Target, Award, Zap, Trophy, Star, Layers,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { precisionColor } from '../utils/precisionColor';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Deck {
  id: string;
  name: string;
  totalCards: number;
  lastStudied?: string;
  pendingCards?: number;
  precision?: number;
}

interface DashboardData {
  currentStreak: number;
  recentDecks: Deck[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Simula los días activos de la semana (en producción vendría del backend)
const getActiveWeekDays = (streak: number): boolean[] => {
  const today = new Date().getDay(); // 0=Dom, 1=Lun ...
  const mondayBased = today === 0 ? 6 : today - 1; // convierte a 0=Lun
  return WEEKDAYS.map((_, i) => i <= mondayBased && i > mondayBased - Math.min(streak, 7));
};

// ─── Achievement data ──────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { icon: Flame, label: 'Racha de Fuego', desc: '7 días seguidos', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { icon: Target, label: 'Francotirador', desc: '100% precisión', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { icon: Zap, label: 'Velocidad Luz', desc: 'Bajo 5s por tarjeta', bg: 'bg-yellow-50', iconColor: 'text-yellow-500' },
  { icon: Trophy, label: 'Mazo Maestro', desc: '50 tarjetas repasadas', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { icon: Star, label: 'Primera Racha', desc: 'Primer día continuo', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Auth & data
  const studentName = localStorage.getItem('userName') || 'Estudiante';

  const [dashboardData, setDashboardData] = useState<DashboardData>({ currentStreak: 0, recentDecks: [] });
  const [dataLoading, setDataLoading] = useState(true);
  const [deckFilter, setDeckFilter] = useState<'all' | 'pending'>('all');

  // AI generator
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);
  const [lastGeneratedId, setLastGeneratedId] = useState('all');

  // Computed stats
  const totalDecks = dashboardData.recentDecks.length;
  const totalReviewed = dashboardData.recentDecks.reduce((acc, d) => acc + (d.totalCards || 0), 0);
  const streak = dashboardData.currentStreak;
  const avgPrecision = dashboardData.recentDecks.length > 0
    ? Math.round(dashboardData.recentDecks.reduce((acc, d) => acc + (d.precision ?? 75), 0) / dashboardData.recentDecks.length)
    : 0;

  const pendingDecks = dashboardData.recentDecks.filter(d => (d.pendingCards ?? d.totalCards) > 0);
  const totalPending = pendingDecks.reduce((acc, d) => acc + (d.pendingCards ?? d.totalCards), 0);
  const dailyGoal = Math.max(totalPending, 20);
  const completedToday = Math.max(0, dailyGoal - totalPending);
  const dailyProgress = Math.round((completedToday / dailyGoal) * 100);

  const activeWeek = getActiveWeekDays(streak);
  const displayedDecks = deckFilter === 'pending' ? pendingDecks : dashboardData.recentDecks;

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'student') { navigate('/'); return; }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('http://localhost:3001/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
          if (data.currentStreak > 0) triggerConfetti();
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const triggerConfetti = () => {
    const end = Date.now() + 2000;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#1E3A8A', '#10B981', '#F59E0B'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1E3A8A', '#10B981', '#F59E0B'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleLogout = () => {
    ['token', 'userId', 'userRole', 'userName'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setGenSuccess(false);
    try {
      const token = localStorage.getItem('token') || '';
      const userId = localStorage.getItem('userId');
      if (!userId) { navigate('/login'); return; }
      const res = await fetch('http://localhost:3001/api/ai/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        const generatedId = data.data?.[0]?.id ?? encodeURIComponent(topic);
        setLastGeneratedId(generatedId);
        setGenSuccess(true);
        setTopic('');
        triggerConfetti();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Error generando tarjetas');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
          <p className="text-slate-500 font-medium">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo-sinfondo.png" alt="MemorIA" className="h-8 w-auto" />
            <span className="text-xl font-bold text-blue-800 tracking-tight">MemorIA</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Pending badge */}
            <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-red-100">
              <Flame className="w-4 h-4 fill-red-500 text-red-500" />
              <span>{totalPending > 0 ? `${totalPending} pendientes` : 'Al día'}</span>
            </div>

            {/* User info + avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{studentName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Estudiante</p>
              </div>
              <div className="bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold select-none shadow-sm">
                {getInitials(studentName)}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── STATS GRID (4 cols) ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Stat Card: Mazos */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="bg-blue-50 p-2.5 rounded-xl">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-wider">MAZOS</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{totalDecks}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Mazos disponibles</p>
          </div>

          {/* Stat Card: Repasadas */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="bg-purple-50 p-2.5 rounded-xl">
                <Book className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-wider">REPASADAS</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{totalReviewed}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Total tarjetas</p>
          </div>

          {/* Stat Card: Racha */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="bg-orange-50 p-2.5 rounded-xl">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-wider">RACHA</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{streak}<span className="text-lg font-semibold text-slate-400 ml-1">días</span></p>
            {/* Mini week tracker */}
            <div className="flex gap-1.5 mt-3">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors
                    ${activeWeek[i] ? 'bg-blue-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Card: Precisión */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-wider">PRECISIÓN</span>
            </div>
            <p className="text-3xl font-black text-emerald-600 mt-3">{avgPrecision}<span className="text-lg font-semibold text-emerald-400">%</span></p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${avgPrecision}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── OBJETIVO DEL DÍA ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full opacity-30 translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-900 rounded-full opacity-20 -translate-x-8 translate-y-8 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest text-blue-200 uppercase">Objetivo del Día</p>
              <h2 className="text-xl font-bold mt-1">
                {totalPending > 0
                  ? `Te faltan ${totalPending} tarjetas para completar tu sesión`
                  : '¡Sesión completada! No tienes pendientes 🎉'}
              </h2>
              <p className="text-sm text-blue-100 mt-0.5">
                {streak > 0
                  ? `¡Sigue así! Estás a solo un repaso de mantener tu racha de ${streak} días.`
                  : 'Estudia hoy para iniciar tu racha de días continuos.'}
              </p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-blue-200 font-medium">{completedToday} completadas hoy</span>
                  <span className="text-xs font-bold text-white">{dailyProgress}%</span>
                </div>
                <div className="w-full bg-blue-900/40 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={() => navigate('/study/all')}
              className="shrink-0 bg-white text-blue-800 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.97] text-sm flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              {totalPending > 0 ? 'Estudiar Ahora' : 'Repasar Todo'}
            </button>
          </div>
        </div>

        {/* ── MIS MAZOS ────────────────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-700" />
              Mis Mazos
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeckFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${deckFilter === 'all'
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setDeckFilter('pending')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${deckFilter === 'pending'
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'}`}
              >
                Pendientes ({pendingDecks.length})
              </button>
            </div>
          </div>

          {/* Deck grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedDecks.length > 0 ? (
              displayedDecks.map((deck) => {
                const pending = deck.pendingCards ?? deck.totalCards;
                const precision = deck.precision ?? 0;
                const progress = deck.totalCards > 0 ? Math.round(((deck.totalCards - pending) / deck.totalCards) * 100) : 0;
                const isComplete = progress === 100;

                return (
                  <div
                    key={deck.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/study/${deck.id}`)}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-50 p-2.5 rounded-xl">
                        <Book className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isComplete
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-orange-50 text-orange-600'}`}>
                        {isComplete ? '⭐ Completo' : `⏱️ ${pending} hoy`}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex-1 mb-4">
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                        {deck.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {deck.totalCards} tarjetas · {deck.lastStudied
                          ? `Estudiado ${new Date(deck.lastStudied).toLocaleDateString('es', { month: 'short', day: 'numeric' })}`
                          : 'Nunca estudiado'}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">Progreso</span>
                        <span className="text-xs font-bold text-slate-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${precisionColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${precision >= 80 ? 'text-emerald-600' : precision >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {precision > 0 ? `${precision}% precisión` : 'Sin datos aún'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/study/${deck.id}`); }}
                        className={`rounded-xl px-4 py-2 text-sm text-white font-semibold shadow-sm transition-transform active:scale-95 ${isComplete ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-700 hover:bg-blue-800'}`}
                      >
                        {isComplete ? 'Repasar ›' : 'Estudiar Ahora ›'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty state + AI generator inline */
              <div className="col-span-full">
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 flex flex-col items-center text-center">
                  <div className="bg-slate-50 p-5 rounded-2xl mb-4">
                    <Book className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-700 font-bold text-lg">No hay mazos {deckFilter === 'pending' ? 'pendientes' : 'disponibles'}</p>
                  <p className="text-slate-400 text-sm mt-1 font-medium max-w-xs">
                    {deckFilter === 'pending'
                      ? '¡Felicidades! Estás al día con todos tus repasos.'
                      : 'Genera tu primer mazo con IA usando el formulario de abajo.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── GENERADOR IA + LOGROS ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* AI Generator (3/5) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-xl">
                <PlusCircle className="w-5 h-5 text-blue-700" />
              </div>
              Generar Mazo con IA
            </h2>
            <p className="text-sm text-slate-400 font-medium mb-5 ml-9">Escribe un tema y la IA creará tarjetas de estudio.</p>

            {!genSuccess ? (
              <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Ej. Revolución Francesa, Álgebra Lineal..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                  className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition-all disabled:opacity-50 text-slate-900 font-medium"
                />
                <button
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-200 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {generating
                    ? <><Loader2 className="animate-spin w-5 h-5" /> Generando con IA...</>
                    : <><Zap className="w-5 h-5" /> Crear Flashcards</>}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-emerald-50 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900">¡Tarjetas generadas!</h3>
                  <p className="text-sm text-slate-400 mt-1">La IA ha creado tu nuevo mazo exitosamente.</p>
                </div>
                <button
                  onClick={() => navigate(`/study/${lastGeneratedId}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
                >
                  <PlayCircle className="w-5 h-5" /> Estudiar ahora
                </button>
                <button onClick={() => setGenSuccess(false)} className="text-slate-400 text-sm font-semibold hover:text-slate-700">
                  Generar otro mazo
                </button>
              </div>
            )}
          </div>

          {/* Achievements (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="bg-amber-50 p-2 rounded-xl">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                Logros Recientes
              </h2>
              <button className="text-sm font-semibold text-blue-600 hover:underline">Ver todos</button>
            </div>

            <div className="flex items-start gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {ACHIEVEMENTS.map((ach, i) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={i}
                    className={`shrink-0 ${ach.bg} border border-slate-100 rounded-xl p-4 w-[6.5rem] flex flex-col items-center justify-center space-y-1.5 text-center`}
                  >
                    <Icon className={`w-7 h-7 ${ach.iconColor}`} />
                    <p className="text-xs font-bold text-slate-800 leading-tight">{ach.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{ach.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
