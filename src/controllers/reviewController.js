const { Flashcard, User, Progress, Section } = require('../models');
const { Op } = require('sequelize');

const getDueReviews = async (req, res) => {
  try {
    const now = new Date();
    const { sectionId } = req.query;
    
    // Obtener las flashcards pendientes para hoy o días anteriores
    const whereClause = {
      next_review: {
        [Op.lte]: now
      }
    };
    
    // Si la autenticación inyecta req.user, filtramos por el usuario actual
    if (req.user && req.user.id) {
      whereClause.userId = req.user.id;
    }

    // Filtrar por mazo específico si se solicita
    if (sectionId && sectionId !== 'all') {
      whereClause.sectionId = sectionId;
    }

    const dueCards = await Flashcard.findAll({
      where: whereClause,
      order: [['next_review', 'ASC']]
    });

    res.status(200).json(dueCards);
  } catch (error) {
    console.error('[reviewController] Error al obtener flashcards pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener las flashcards' });
  }
};

const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { quality, tiempo_empleado = 0 } = req.body;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'La calidad (quality) debe ser un número entre 0 y 5' });
    }

    const card = await Flashcard.findByPk(id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard no encontrada' });
    }
    
    // Validar que el usuario sea el dueño de la flashcard
    if (req.user && req.user.id && card.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para repasar esta flashcard' });
    }

    // Lógica del Algoritmo SM-2
    let { repetitions, easiness_factor, interval } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness_factor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easiness_factor < 1.3) {
      easiness_factor = 1.3;
    }

    // Calcular próxima revisión
    const next_review = new Date();
    next_review.setDate(next_review.getDate() + interval);

    // Actualizar flashcard en la base de datos
    card.repetitions = repetitions;
    card.easiness_factor = easiness_factor;
    card.interval = interval;
    card.next_review = next_review;

    await card.save();

    // Actualizar Progreso (Progress) para historial detallado
    if (req.user && req.user.id) {
      await Progress.upsert({
        UserId: req.user.id,
        FlashcardId: card.id,
        easiness_factor,
        interval,
        repetitions,
        next_review_date: next_review,
        tiempo_empleado: tiempo_empleado
      });

      // Lógica de Racha (Streak)
      const user = await User.findByPk(req.user.id);
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día de hoy

        let lastStudyDate = user.last_study_date;
        let streak = user.current_streak || 0;

        if (!lastStudyDate) {
          // Primera vez que estudia
          streak = 1;
        } else {
          lastStudyDate = new Date(lastStudyDate);
          lastStudyDate.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(today - lastStudyDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Estudió ayer
            streak += 1;
          } else if (diffDays > 1) {
            // Perdió la racha
            streak = 1;
          }
          // Si diffDays === 0, ya estudió hoy, no se suma
        }

        user.current_streak = streak;
        user.last_study_date = new Date(); // Actualizamos a la hora actual
        await user.save();
      }
    }

    res.status(200).json(card);
  } catch (error) {
    console.error('[reviewController] Error al procesar el repaso:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el repaso' });
  }
};

module.exports = {
  getDueReviews,
  submitReview
};
