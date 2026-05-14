const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
  // teacherId será añadido mediante las asociaciones
}, {
  timestamps: true,
});

module.exports = Section;
