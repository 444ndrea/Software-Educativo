const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Rutas base: /api/config
router.get('/', configController.getConfig);
router.post('/', configController.updateConfig);

module.exports = router;
