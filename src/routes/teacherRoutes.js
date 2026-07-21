const express = require('express');
const router = express.Router();
const { requireAuth, requireTeacher } = require('../middlewares/authMiddleware');
const teacherController = require('../controllers/teacherController');

// Main dashboard
router.get('/dashboard', requireAuth, requireTeacher, teacherController.getDashboard);

// Legacy admin stats alias
router.get('/admin/stats', requireAuth, requireTeacher, teacherController.getDashboard);

// Analytics report for a student in a deck
router.get('/report/student/:studentId/deck/:deckId', requireAuth, requireTeacher, teacherController.getReport);

// Export CSV
router.get('/export/student/:studentId', requireAuth, requireTeacher, teacherController.exportCSV);

// Toggle section status (Aprobar / Deshabilitar)
router.put('/sections/:id/status', requireAuth, requireTeacher, teacherController.toggleSectionStatus);

module.exports = router;
