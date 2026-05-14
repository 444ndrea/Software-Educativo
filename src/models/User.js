const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false,
    defaultValue: 'student',
  },
  current_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  last_study_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = User;
