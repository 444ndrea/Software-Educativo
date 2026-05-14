const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { generateCards } = require('../controllers/aiController');

// Endpoint orquestador de la Inteligencia artificial 
// Puedes incluir 'requireTeacher' en los middlewares si solo los profesores deberían acceder
router.post('/generate-cards', generateCards);

module.exports = router;
