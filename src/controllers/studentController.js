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
    
    // Obtener secciones/mazos del usuario con la fecha de la última vez que se estudió
    // Para simplificar, buscamos las secciones de las flashcards que el usuario posee
    // y para cada una buscamos el último progress
    
    // Todas las flashcards del usuario
    const userFlashcards = await Flashcard.findAll({
      where: { userId: userId },
      include: [
        { model: Section, as: 'section' }
      ]
    });

    const sectionsMap = new Map();

    for (const card of userFlashcards) {
      if (card.section) {
        if (!sectionsMap.has(card.section.id)) {
          sectionsMap.set(card.section.id, {
            id: card.section.id,
            name: card.section.name,
            totalCards: 0,
            lastStudied: null
          });
        }
        
        const sectionData = sectionsMap.get(card.section.id);
        sectionData.totalCards += 1;
        
        // Buscar el último progreso de esta tarjeta
        const progress = await Progress.findOne({
          where: { UserId: userId, FlashcardId: card.id },
          order: [['updatedAt', 'DESC']]
        });

        if (progress) {
          if (!sectionData.lastStudied || progress.updatedAt > sectionData.lastStudied) {
            sectionData.lastStudied = progress.updatedAt;
          }
        }
      }
    }

    const recentDecks = Array.from(sectionsMap.values()).sort((a, b) => {
      // Ordenar por fecha más reciente
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
