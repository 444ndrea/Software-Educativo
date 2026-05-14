const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const studentController = require('../controllers/studentController');

router.get('/dashboard', requireAuth, studentController.getDashboardStats);

module.exports = router;
