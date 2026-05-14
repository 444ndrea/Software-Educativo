const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de Sequelize para usar SQLite localmente
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: false, // Desactivar logs de SQL en la consola para mayor limpieza
});

module.exports = sequelize;
