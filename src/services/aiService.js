const OpenAI = require('openai');

// Verifica que la variable de entorno exista, o tira un error claro
if (!process.env.GROQ_API_KEY) {
  console.warn('[Advertencia] Falta validar la variable de entorno GROQ_API_KEY.');
}

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const generateFlashcards = async (topic) => {
  try {
    const prompt = `Genera 5 flashcards sobre ${topic} en formato JSON puro (sin markdown): [{"side_a": "pregunta", "side_b": "respuesta"}].`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    // Extraemos el texto de la respuesta
    const responseText = response.choices[0].message.content;

    // Buscar específicamente el contenido entre corchetes para evitar el texto conversacional extra
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error('La IA no devolvió un formato JSON válido. Respuesta cruda: ' + responseText);
    }

    const flashcards = JSON.parse(jsonMatch[0]);

    return flashcards;
  } catch (error) {
    console.error('[aiService] Fallo al generar o parsear flashcards:', error);
    throw new Error(`La generación de flashcards ha fallado: ${error.message}`);
  }
};

module.exports = {
  generateFlashcards
};
