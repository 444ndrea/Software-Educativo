const { GoogleGenerativeAI } = require('@google/generative-ai');

// INICIALIZACIÓN: Inicializa el cliente usando la variable de entorno
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFlashcards = async (topic) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Genera un arreglo estructurado en JSON puro con exactamente 5 objetos que contengan SOLO las propiedades "pregunta" y "respuesta" basados en el tema: "${topic}". No agregues texto introductorio, ni Markdown, ni IDs.`;
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Limpiar etiquetas de formato markdown si existieran
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(responseText);
    
    // Retornamos los objetos limpios solo con { pregunta, respuesta }
    return parsed.map(card => ({
      pregunta: card.pregunta,
      respuesta: card.respuesta
    }));
  } catch (error) {
    console.error('[aiService] Error con la API de Gemini:', error);
    
    // BLOQUE DE RESPALDO (TRY/CATCH): Retorna objetos limpios { pregunta, respuesta }
    return [
      { pregunta: "¿Cuál es la definición principal de " + topic + "?", respuesta: "Es el concepto fundamental estructurado en esta sesión de estudio." },
      { pregunta: "¿Menciona una característica clave sobre " + topic + "?", respuesta: "Su alta relevancia e impacto en el desarrollo del proyecto." },
      { pregunta: "¿Qué aspecto técnico se debe considerar en " + topic + "?", respuesta: "La correcta implementación de sus componentes esenciales." },
      { pregunta: "¿Cuál es el objetivo principal de analizar " + topic + "?", respuesta: "Optimizar el flujo de trabajo y comprender su comportamiento." },
      { pregunta: "¿Qué conclusión podemos extraer de " + topic + "?", respuesta: "Que representa una pieza clave para la arquitectura del sistema." }
    ];
  }
};

module.exports = { generateFlashcards };
