const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  easiness_factor: {
    type: DataTypes.FLOAT,
    defaultValue: 2.5,
    allowNull: false,
  },
  interval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  repetitions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  next_review_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  tiempo_empleado: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
  // userId y flashcardId serán añadidos mediante las asociaciones
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'FlashcardId'] // Un progreso único por estudiante y tarjeta
    }
  ]
});

module.exports = Progress;
