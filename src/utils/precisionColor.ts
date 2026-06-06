/**
 * Calcula un color Tailwind basado en el porcentaje de rendimiento.
 * @param percent Porcentaje de éxito (0 a 100)
 * @returns string con las clases de fondo de TailwindCSS
 */
export const precisionColor = (percent: number | undefined): string => {
  if (percent === undefined || isNaN(percent)) return 'bg-gray-200'; // Fallback
  
  if (percent >= 80) return 'bg-green-500'; // ¡Excelente!
  if (percent >= 50) return 'bg-amber-400'; // Intermedio/Revisar algo
  return 'bg-red-500'; // Dificultad alta / Repasar
};
