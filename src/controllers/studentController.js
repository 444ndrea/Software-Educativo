const { User, Section, Flashcard, Progress } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Calcular total de flashcards estudiadas hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { Op } = require('sequelize');

    // Obtener las secciones/mazos filtrados
    const allSections = await Section.findAll({
      include: [
        { model: Flashcard, as: 'flashcards', attributes: ['id'] },
        { model: User, as: 'teacher', attributes: ['role'] }
      ],
      where: {
        [Op.or]: [
          { teacherId: userId }, // Creados por el propio estudiante
          { teacherId: null }, // Públicos / Legacy
          { '$teacher.role$': 'teacher' } // Creados por cualquier profesor
        ]
      }
    });

    const sectionsMap = new Map();

    for (const section of allSections) {
      sectionsMap.set(section.id, {
        id: section.id,
        name: section.name,
        totalCards: section.flashcards.length,
        lastStudied: null
      });
      
      // Buscar el último progreso de este usuario para cualquier tarjeta de esta sección
      if (section.flashcards && section.flashcards.length > 0) {
        const cardIds = section.flashcards.map(c => c.id);
        const progress = await Progress.findOne({
          where: { UserId: userId, FlashcardId: cardIds },
          order: [['updatedAt', 'DESC']]
        });

        if (progress) {
          sectionsMap.get(section.id).lastStudied = progress.updatedAt;
        }
      }
    }

    const recentDecks = Array.from(sectionsMap.values()).sort((a, b) => {
      // Ordenar por fecha más reciente, si no hay poner al final
      if (!a.lastStudied && !b.lastStudied) return 0;
      if (!a.lastStudied) return 1;
      if (!b.lastStudied) return -1;
      return b.lastStudied - a.lastStudied;
    });

    res.status(200).json({
      currentStreak: user.current_streak || 0,
      recentDecks: recentDecks
    });

  } catch (error) {
    console.error('[studentController] Error obteniendo dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener datos del dashboard' });
  }
};

module.exports = {
  getDashboardStats
};
