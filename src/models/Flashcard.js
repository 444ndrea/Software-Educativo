const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Flashcard = sequelize.define('Flashcard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  side_a: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  side_b: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_ai_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  source_material: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repetitions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  easiness_factor: {
    type: DataTypes.FLOAT,
    defaultValue: 2.5,
  },
  interval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  next_review: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
  // sectionId será añadido mediante las asociaciones
}, {
  timestamps: true,
});

module.exports = Flashcard;
