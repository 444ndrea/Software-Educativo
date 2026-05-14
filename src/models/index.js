const sequelize = require('../config/database');
const User = require('./User');
const Section = require('./Section');
const Flashcard = require('./Flashcard');
const Progress = require('./Progress');

// Definición de las Asociaciones

// 1. Profesor tiene muchas secciones
User.hasMany(Section, { foreignKey: 'teacherId', as: 'sections' });
Section.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// 2. Sección tiene muchos Estudiantes (Añadimos sectionId a User)
Section.hasMany(User, { foreignKey: 'sectionId', as: 'students' });
User.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

// 3. Sección tiene muchas Flashcards
Section.hasMany(Flashcard, { foreignKey: 'sectionId', as: 'flashcards' });
Flashcard.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

// 4. Usuario (Estudiante) tiene muchos Progresos
User.hasMany(Progress, { foreignKey: 'UserId' });
Progress.belongsTo(User, { foreignKey: 'UserId' });

// 5. Flashcard tiene muchos Progresos
Flashcard.hasMany(Progress, { foreignKey: 'FlashcardId' });
Progress.belongsTo(Flashcard, { foreignKey: 'FlashcardId' });

// 6. Usuario tiene muchas Flashcards (creador/dueño de la tarjeta)
User.hasMany(Flashcard, { foreignKey: 'userId', as: 'myFlashcards' });
Flashcard.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Section,
  Flashcard,
  Progress
};
