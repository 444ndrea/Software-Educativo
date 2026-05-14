const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Obtener todas las tarjetas que tocan repasar hoy
router.get('/due', requireAuth, reviewController.getDueReviews);

// Enviar calificación de repaso (quality de 0 a 5)
router.post('/:id', requireAuth, reviewController.submitReview);

module.exports = router;
