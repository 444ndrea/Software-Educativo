const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validación básica de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: name, email o password' });
    }

    // 1. Validar que el email no exista ya en la base de datos
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado' });
    }

    // 2. Encriptar la contraseña (hash)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Definir rol (por defecto student)
    const userRole = role === 'teacher' ? 'teacher' : 'student';

    // 3. Crear el nuevo usuario en SQLite vía Sequelize
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    // 4. Devolver mensaje de éxito y datos del usuario (excluyendo password)
    const userData = newUser.toJSON();
    delete userData.password;

    return res.status(201).json({
      message: 'yo la mejor',
      user: userData
    });
  } catch (error) {
    console.error('[authController] Error en el registro:', error);
    return res.status(500).json({ error: 'Error interno o de base de datos durante el registro' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica de entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: email o password' });
    }

    // 1. Buscar al usuario por correo electrónico
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Devolvemos un error genérico por seguridad (evitar enumeración de usuarios)
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Usar bcrypt.compare para verificar la contraseña introducida contra el hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar Token JWT con el ROL y el ID
    const payload = {
      id: user.id,
      role: user.role
    };

    // Usando la variable de entorno JWT_SECRET de forma estricta
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '72h', // El token es válido por 3 días
    });

    // 4. Devolver el token generado para uso en endpoints protegidos
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[authController] Error en el login:', error);
    return res.status(500).json({ error: 'Error interno durante el inicio de sesión' });
  }
};

module.exports = {
  register,
  login
};
