const aiService = require('../services/aiService');
const { Flashcard, Section } = require('../models');

const generateCards = async (req, res) => {
  try {
    const { topic } = req.body; 

    // Validación básica
    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Falta el campo "topic" en el cuerpo de la petición' });
    }

    const userId = (req.user && req.user.id) ? req.user.id : req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado y no se proporcionó userId en el body.' });
    }

    console.log(`[aiController] Solicitando flashcards a Gemini para el tema: "${topic}"`);

    // Llamar al servicio AI centralizado
    const generatedFlashcards = await aiService.generateFlashcards(topic);

    // Buscar o crear la sección (Mazo) para este tema
    let [section] = await Section.findOrCreate({
      where: { name: topic },
      defaults: {
        name: topic,
        teacherId: userId // Asociamos el mazo al creador (sea profesor o estudiante)
      }
    });

    // Preparar el array de tarjetas para añadir el userId, sectionId y marcar como generadas por IA
    // Preparar el array de tarjetas para añadir el userId, sectionId y marcar como generadas por IA
    // Mapeamos pregunta -> side_a y respuesta -> side_b para cumplir con las restricciones NOT NULL de SQLite
    const flashcardsData = generatedFlashcards.map(card => ({
      side_a: card.pregunta,
      side_b: card.respuesta,
      userId: userId,
      sectionId: section.id,
      is_ai_generated: true
    }));

    // Guardar las tarjetas generadas en la base de datos
    const savedFlashcards = await Flashcard.bulkCreate(flashcardsData);

    // Devolvemos las tarjetas generadas ya con sus IDs de la BD
    return res.status(200).json({
      success: true,
      message: 'Tarjetas generadas y guardadas exitosamente',
      data: savedFlashcards,
      sectionId: section.id
    });
  } catch (error) {
    console.error('[aiController] Error:', error.message);
    return res.status(500).json({ error: error.message || 'Error del servidor al orquestar la Inteligencia Artificial.' });
  }
};

module.exports = {
  generateCards
};
