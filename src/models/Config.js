const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1, // Single row approach
  },
  tiempoPrevisualizacion: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  nombreProfesor: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  asignatura: {
    type: DataTypes.STRING,
    defaultValue: '',
  }
}, {
  timestamps: true,
});

module.exports = Config;
