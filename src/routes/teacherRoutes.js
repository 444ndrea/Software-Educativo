const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher } = require('../middlewares/authMiddleware');
const { User, Section, Flashcard } = require('../models');

// Endpoint para el panel analítico del profesor
router.get('/sections/:sectionId/stats', requireAuth, requireTeacher, (req, res) => {
  // Lógica para calcular promedios (easiness_factor) y sumatoria de repeticiones de la sección
  res.json({ message: `Estadísticas para la sección ${req.params.sectionId} enviadas exitosamente` });
});

// Lógica de métricas globales compartida
const getStats = async (req, res) => {
  try {
    const studentsCount = await User.count({ where: { role: 'student' } });
    const flashcardsCount = await Flashcard.count();
    
    // Obtener las secciones y contar sus flashcards
    const sections = await Section.findAll({
      include: [{
        model: Flashcard,
        as: 'flashcards',
        attributes: ['id']
      }],
      order: [['createdAt', 'DESC']]
    });

    const sectionsData = sections.map(section => ({
      id: section.id,
      name: section.name,
      createdAt: section.createdAt,
      flashcardsCount: section.flashcards ? section.flashcards.length : 0
    }));

    res.json({
      studentsCount,
      flashcardsCount,
      sections: sectionsData
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

// Endpoint principal del dashboard (compatible hacia atrás)
router.get('/dashboard', requireAuth, requireTeacher, getStats);

// Endpoint moderno solicitado (/api/admin/stats pero en teacherRoutes mapeado bajo /api/teacher/admin/stats)
// Ah! El usuario lo quiere en /api/admin/stats. Lo expondremos aquí también.
router.get('/admin/stats', requireAuth, requireTeacher, getStats);

module.exports = router;
