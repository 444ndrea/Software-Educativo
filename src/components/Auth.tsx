import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        let data: any = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
        } catch (e) {}

        if (isLogin) {
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userRole', data.user.role);
            navigate('/');
          } else {
            setError('Error: Respuesta inesperada del servidor.');
          }
        } else {
          setIsLogin(true);
          setPassword('');
          setError('');
        }
      } else {
        let errData: any = {};
        try {
          const text = await res.text();
          errData = text ? JSON.parse(text) : {};
        } catch (e) {}
        setError(errData.error || 'Ocurrió un error en la autenticación.');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Columna Izquierda: Branding (Solo Visible en Desktop) */}
      <div className="hidden md:flex w-1/2 flex-col justify-between bg-gradient-to-br from-[#1E3A8A] to-[#172554] p-[40px] relative overflow-hidden">
        {/* Logo Superior Izquierdo */}
        {/* Logo Superior Izquierdo */}
        <div className="flex items-center z-10">
          <img
            src="/logo-blanco.png"
            alt="MemorIA Logo"
            className="h-32 w-auto object-contain"
          />
        </div>

        {/* Neural Network SVG Center (Abstract Concept) */}
        <div className="flex-1 flex justify-center items-center z-10 w-full">
          <svg className="w-full max-w-md opacity-80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <polyline points="40,80 100,20 160,80 180,150 100,180 20,150 40,80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <polyline points="100,20 100,100 160,80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <polyline points="40,80 100,100 100,180" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="100" y1="100" x2="180" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="100" y1="100" x2="20" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Nodos */}
            <circle cx="100" cy="20" r="5" fill="white" className="animate-pulse" />
            <circle cx="40" cy="80" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="160" cy="80" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="20" cy="150" r="3" fill="rgba(255,255,255,0.6)" />
            <circle cx="180" cy="150" r="3" fill="rgba(255,255,255,0.6)" />
            <circle cx="100" cy="180" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="100" cy="100" r="6" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
          </svg>
        </div>

        {/* Eslogan Inferior */}
        <div className="z-10">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Estudia de forma inteligente.</h2>
          <p className="text-blue-200 text-lg">Retención a largo plazo con algoritmos de IA.</p>
        </div>

        {/* Efecto de fondo sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white min-h-screen">
        {/* Logo para móvil exclusivamente */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <div className="bg-[#1E3A8A] p-3 rounded-2xl mb-3 shadow-lg">
            <img src="/logo-sinfondo.png" alt="MemorIA Logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-gray-900 text-xl font-bold tracking-wide">MemorIA</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu Cuenta'}
            </h1>
            <p className="text-gray-500 mt-2 text-base md:text-lg">
              {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Únete para empezar a estudiar inteligentemente.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center justify-center font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 cursor-pointer">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all shadow-sm"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 cursor-pointer">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all shadow-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700 cursor-pointer">Contraseña</label>
                {isLogin && <a href="#" className="text-sm font-medium text-[#1E3A8A] hover:underline">¿Olvidaste tu contraseña?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rol de Usuario</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="student">Estudiante</option>
                    <option value="teacher">Profesor</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#172554] disabled:bg-blue-300 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : isLogin ? (
                <>Iniciar Sesión &rarr;</>
              ) : (
                <>Registrarse &rarr;</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
              }}
              className="text-[#1E3A8A] font-bold hover:underline ml-1"
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
