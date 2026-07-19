const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const aiRoutes = require('./aiRoutes');
const reviewRoutes = require('./reviewRoutes');
const configRoutes = require('./configRoutes');

router.use('/auth', authRoutes);
router.use('/teacher', teacherRoutes);
router.use('/admin', teacherRoutes); // Para endpoints como /api/admin/stats
router.use('/student', studentRoutes);
router.use('/ai', aiRoutes);
router.use('/reviews', reviewRoutes);
router.use('/config', configRoutes);

module.exports = router;
