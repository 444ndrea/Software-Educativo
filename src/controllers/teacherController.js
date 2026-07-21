const { User, Section, Flashcard, Progress, sequelize } = require('../models');

const getDashboard = async (req, res) => {
  try {
    const studentsCount = await User.count({ where: { role: 'student' } });
    const flashcardsCount = await Flashcard.count();
    
    // Catalog of sections
    const allSections = await Section.findAll({
      include: [
        { model: Flashcard, as: 'flashcards', attributes: ['id'] },
        { model: User, as: 'teacher', attributes: ['name', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const officialSectionsCount = allSections.filter(s => s.teacher && s.teacher.role === 'teacher').length;

    const sectionsData = allSections.map(section => ({
      id: section.id,
      name: section.name,
      createdAt: section.createdAt,
      flashcardsCount: section.flashcards ? section.flashcards.length : 0,
      autor: section.teacher ? section.teacher.name : 'Profesor',
      estado: section.estado || 'activo'
    }));

    // Students Performance
    const students = await User.findAll({
      where: { role: 'student' },
      include: [
        { model: Progress, attributes: ['easiness_factor'] }
      ]
    });

    const studentsData = students.map(student => {
      let score = 0;
      if (student.Progresses && student.Progresses.length > 0) {
        const sumEf = student.Progresses.reduce((acc, p) => acc + p.easiness_factor, 0);
        const avgEf = sumEf / student.Progresses.length;
        // Map average EF (around 1.3 to 2.5+) to a 0-100 score
        score = Math.min(100, Math.round((avgEf / 2.5) * 100));
      }
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
        score
      };
    });

    res.json({
      studentsCount,
      officialSectionsCount,
      flashcardsCount,
      sections: sectionsData,
      students: studentsData
    });
  } catch (error) {
    console.error('Error in teacher dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

const getReport = async (req, res) => {
  try {
    const { studentId, deckId } = req.params;
    const { Op } = require('sequelize');

    const deck = await Section.findByPk(deckId, {
      include: [{ model: Flashcard, as: 'flashcards', attributes: ['id'] }]
    });

    if (!deck) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }

    const totalCards = deck.flashcards.length;
    const cardIds = deck.flashcards.map(c => c.id);

    const progresses = await Progress.findAll({
      where: { 
        UserId: studentId, 
        FlashcardId: { [Op.in]: cardIds } 
      },
      include: [{ model: Flashcard, attributes: ['side_a'] }]
    });

    // 1. Conteo directo de tarjetas completadas (registros existentes)
    const consolidadas = progresses.length;
    
    // 2. Tasa de acierto: Promedio del easiness_factor y Desglose
    let sumEf = 0;
    let facilesCount = 0;
    let bienCount = 0;
    let dificilCount = 0;

    progresses.forEach(p => {
      const ef = p.easiness_factor != null ? parseFloat(p.easiness_factor) : 2.5;
      sumEf += ef;
      if (ef >= 2.5) facilesCount++;
      else if (ef >= 2.0) bienCount++;
      else dificilCount++;
    });
    
    const tasaAcierto = progresses.length > 0 
      ? Math.min(100, Math.max(0, Math.round((sumEf / progresses.length) / 2.5 * 100))) 
      : 0;

    // Alertas pedagógicas: EF < 1.5
    const alertas = progresses
      .filter(p => p.easiness_factor != null && parseFloat(p.easiness_factor) < 1.5)
      .map(p => ({
        pregunta: p.Flashcard.side_a,
        easiness_factor: parseFloat(p.easiness_factor).toFixed(2)
      }));

    // Constancia: simulada basada en racha del estudiante
    const student = await User.findByPk(studentId);
    const constancia = student ? Math.min(100, (student.current_streak || 0) * 10) : 0;

    res.json({
      totalTarjetas: totalCards,
      facilesCount,
      desglose: {
        facil: facilesCount,
        bien: bienCount,
        dificil: dificilCount
      },
      progreso: {
        totales: totalCards,
        consolidadas
      },
      rendimiento: {
        tasaAcierto,
        constancia
      },
      alertas
    });
  } catch (error) {
    console.error('Error in student report:', error);
    res.status(500).json({ error: 'Error al obtener el reporte analítico' });
  }
};

const exportCSV = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findByPk(studentId, {
      include: [{ model: Progress, include: [{ model: Flashcard, include: [{ model: Section, as: 'section' }] }] }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    let overallScore = 0;
    if (student.Progresses && student.Progresses.length > 0) {
      const sumEf = student.Progresses.reduce((acc, p) => acc + p.easiness_factor, 0);
      overallScore = Math.min(100, Math.round((sumEf / student.Progresses.length) / 2.5 * 100));
    }

    const mazosSet = new Set();
    const alertasArray = [];
    let totalTimeSpent = 0;

    (student.Progresses || []).forEach(p => {
      if (p.Flashcard && p.Flashcard.section) {
        mazosSet.add(p.Flashcard.section.name);
      }
      if (p.easiness_factor < 1.5 && p.Flashcard) {
        alertasArray.push(p.Flashcard.side_a.replace(/;/g, ',')); // Evitar conflictos con el separador ;
      }
      totalTimeSpent += (p.time_spent || 0);
    });

    const averageTimeSpent = student.Progresses && student.Progresses.length > 0 
      ? Math.round(totalTimeSpent / student.Progresses.length) 
      : 0;

    const mazosStr = Array.from(mazosSet).join(', ') || 'Ninguno';
    const alertasStr = alertasArray.join(' | ') || 'Ninguna';

    // Formateo de fecha DD/MM/YYYY
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    // Construcción del CSV nativo
    const rows = [
      ['Nombre', 'Email', 'Rendimiento General', 'Mazos Estudiados', 'Alertas Pedagógicas', 'Tiempo Total (s)', 'Tiempo Promedio/Tarjeta (s)', 'Fecha de Reporte'],
      [
        student.name,
        student.email,
        `${overallScore}%`,
        mazosStr,
        alertasStr,
        totalTimeSpent,
        averageTimeSpent,
        dateStr
      ]
    ];

    const csvContent = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');

    // Headers para forzar descarga
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_${student.name.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Error al exportar los datos' });
  }
};

const toggleSectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const section = await Section.findByPk(id);
    if (!section) return res.status(404).json({ error: 'Mazo no encontrado' });
    
    section.estado = estado;
    await section.save();
    
    res.json({ message: 'Estado actualizado', section });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del mazo' });
  }
};

module.exports = {
  getDashboard,
  getReport,
  exportCSV,
  toggleSectionStatus
};
