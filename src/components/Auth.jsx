import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, role };

    try {
      // Usamos la URL base (http://localhost:3001) para asegurar que conecte con el backend 
      // aunque el proxy debería funcionar, es más seguro si ya hemos tenido problemas previos.
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error en la autenticación.');
        return;
      }

      // Si es exitoso, guardar token y userId en LocalStorage
      // El backend devuelve { message, token, user: { id, name, email, role } }
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', data.user.role);
        
        // Redirigir al Dashboard
        navigate('/');
      } else {
        // En caso de que el backend cambie su formato de respuesta
        setError('Error: Respuesta inesperada del servidor.');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          {isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu Cuenta'}
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {isLogin ? 'Ingresa tus credenciales para continuar' : 'Únete para empezar a estudiar inteligentemente'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Juan Pérez"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="student">Estudiante</option>
                <option value="teacher">Profesor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Iniciar Sesión</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Registrarse</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
