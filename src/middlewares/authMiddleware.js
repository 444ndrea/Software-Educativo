const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Nota: en producción el secret debe venir exclusivamente de `process.env.JWT_SECRET`
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Inyecta el usuario desencriptado { id, role, ... } en req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
};

const requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Acceso denegado. Esta ruta requiere privilegios de profesor.' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireTeacher
};
