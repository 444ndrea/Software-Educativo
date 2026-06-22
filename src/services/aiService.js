const OpenAI = require('openai');

let openai = null;
const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Falta la variable de entorno GROQ_API_KEY en el servidor.');
    }
    openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return openai;
};

const generateFlashcards = async (topic) => {
  try {
    const client = getOpenAIClient();
    const prompt = `Genera un arreglo con exactamente 5 flashcards educativas para estudiantes sobre el tema: "${topic}". 
    Debe ser un formato JSON estructurado estrictamente de la siguiente forma:
    [
      {"side_a": "Pregunta o concepto clave", "side_b": "Explicación o respuesta corta"}
    ]`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres un asistente educativo experto que genera contenido en formato JSON puro. No agregues introducciones, comentarios ni bloques de código markdown."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0].message.content.trim();
    const flashcards = JSON.parse(responseText);
    return Array.isArray(flashcards) ? flashcards : (flashcards.flashcards || []);
  } catch (error) {
    console.error('[aiService] Error:', error);
    throw new Error(`La generación de flashcards ha fallado: ${error.message}`);
  }
};

module.exports = { generateFlashcards };
