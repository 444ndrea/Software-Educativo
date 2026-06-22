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
  time_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: false, // Explícitamente indicamos que NO es único individualmente
  },
  FlashcardId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: false, // Explícitamente indicamos que NO es único individualmente
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'FlashcardId'] // La única combinación única permitida
    }
  ]
});

module.exports = Progress;
