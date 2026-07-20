export const generateFlashcards = async (tema) => {
  try {
    console.log("[aiService] Generando flashcards con Gemini para:", tema);

    const apiKey = process.env.GEMINI_API_KEY;
    
    // 1. Consultar la lista de modelos disponibles para la API Key
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const modelsResponse = await fetch(listModelsUrl);
    
    let selectedModel = "models/gemini-1.5-flash"; // Modelo por defecto

    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      const availableModels = modelsData.models || [];
      
      // Buscar un modelo que admita generateContent (priorizando flash o pro)
      const validModel = availableModels.find(m => 
        m.supportedGenerationMethods?.includes("generateContent") && 
        (m.name.includes("flash") || m.name.includes("pro"))
      ) || availableModels.find(m => m.supportedGenerationMethods?.includes("generateContent"));

      if (validModel) {
        selectedModel = validModel.name;
      }
    }

    console.log(`[aiService] Usando modelo detectado: ${selectedModel}`);

    // 2. Realizar la petición con el modelo disponible
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${selectedModel}:generateContent?key=${apiKey}`;

    const promptText = `Actúa como un docente experto. Genera un arreglo JSON de exactamente 5 flashcards educativas concisas y directas sobre el tema: "${tema}".
    REGLAS DE LONGITUD:
    - Pregunta: Breve y clara (máximo 15 palabras).
    - Respuesta: Directa y concreta, ideal para memorización rápida (máximo 2 a 3 oraciones cortas o menos de 30 palabras).
    Cada objeto debe tener exactamente las llaves "pregunta" y "respuesta".
    Devuelve ÚNICAMENTE el arreglo JSON puro, sin bloques de código markdown, ni texto adicional. Ejemplo: [{"pregunta":"...","respuesta":"..."}]`;
    const response = await fetch(generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("[aiService] ¡ÉXITO! Respuesta RAW de Gemini:", rawText);

    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("[aiService] ERROR EN PETICIÓN FETCH:", error);

    // Respaldo local de contingencia en caso de error
    return [
      { pregunta: "¿Cuál es la definición fundamental de " + tema + "?", respuesta: "Es el concepto principal que describe la esencia de este fenómeno o tema de estudio." },
      { pregunta: "¿Cuáles son las características clave asociadas a " + tema + "?", respuesta: "Incluye una serie de atributos y propiedades que lo distinguen de otros conceptos similares." },
      { pregunta: "¿Por qué es importante el estudio de " + tema + "?", respuesta: "Su comprensión es fundamental para analizar las dinámicas y el impacto que tiene en su entorno." },
      { pregunta: "¿Menciona un ejemplo o aplicación práctica de " + tema + "?", respuesta: "Se puede observar en situaciones concretas donde sus principios interactúan con la realidad." },
      { pregunta: "¿Qué aspecto técnico o estructural define a " + tema + "?", respuesta: "Se basa en una serie de componentes y mecanismos que regulan su funcionamiento e interacciones." }
    ];
  }
};