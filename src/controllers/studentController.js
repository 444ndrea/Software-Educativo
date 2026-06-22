const { User, Section, Flashcard, Progress } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { Op } = require('sequelize');
    const now = new Date();

    // Obtener las secciones/mazos filtrados
    const allSections = await Section.findAll({
      include: [
        { model: Flashcard, as: 'flashcards', attributes: ['id'] },
        { model: User, as: 'teacher', attributes: ['role'] }
      ],
      where: {
        [Op.or]: [
          { teacherId: userId },
          { teacherId: null },
          { '$teacher.role$': 'teacher' }
        ]
      }
    });

    const totalReviewed = await Progress.count({ where: { UserId: userId } });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const completedToday = await Progress.count({
      where: {
        UserId: userId,
        updatedAt: { [Op.gte]: startOfDay }
      }
    });

    const recentDecks = [];

    for (const section of allSections) {
      if (!section.flashcards || section.flashcards.length === 0) {
        recentDecks.push({
          id: section.id,
          name: section.name,
          totalCards: 0,
          pendingCards: 0,
          precision: 0,
          lastStudied: null
        });
        continue;
      }

      const cardIds = section.flashcards.map(c => c.id);
      const totalCards = cardIds.length;

      const progresses = await Progress.findAll({
        where: { UserId: userId, FlashcardId: cardIds }
      });

      let pendingCards = totalCards;
      let sumEf = 0;
      let lastStudied = null;

      for (const p of progresses) {
        // Validación segura de fecha
        let nextRev = new Date(p.next_review_date);
        if (isNaN(nextRev.getTime())) {
          nextRev = new Date(0); // Forzar como vencida si es inválida
        }

        if (nextRev > now) {
          pendingCards--; // No está pendiente si next_review es en el futuro
        }
        sumEf += (p.easiness_factor != null ? parseFloat(p.easiness_factor) : 2.5);
        
        let updated = new Date(p.updatedAt);
        if (!isNaN(updated.getTime()) && (!lastStudied || updated > lastStudied)) {
          lastStudied = updated;
        }
      }

      const studiedCards = progresses.length;

      const precision = studiedCards > 0 
        ? Math.round((sumEf / studiedCards) / 2.5 * 100)
        : 0;

      recentDecks.push({
        id: section.id,
        name: section.name,
        totalCards,
        pendingCards,
        studiedCards,
        precision: Math.min(100, Math.max(0, precision)),
        lastStudied
      });
    }

    recentDecks.sort((a, b) => {
      if (!a.lastStudied && !b.lastStudied) return 0;
      if (!a.lastStudied) return 1;
      if (!b.lastStudied) return -1;
      return b.lastStudied - a.lastStudied;
    });

    console.log("DATOS ENVIADOS AL DASHBOARD:", JSON.stringify(recentDecks, null, 2));

    res.status(200).json({
      currentStreak: user.current_streak || 0,
      totalReviewed,
      completedToday,
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
