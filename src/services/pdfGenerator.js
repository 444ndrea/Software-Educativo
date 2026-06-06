import jsPDF from 'jspdf';

/**
 * Genera y descarga la Ficha Pedagógica Oficial en PDF.
 *
 * @param {Object} student  - { id, name, email }
 * @param {Object} reportData - respuesta del endpoint /api/reportes/...
 *                             Puede ser null si se llama desde el panel
 *                             sin reporte cargado (se generará un PDF base).
 */
export const generarFichaPedagogica = (student, reportData = null) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const MARGEN   = 18;
  const ANCHO    = 210 - MARGEN * 2;
  const AZUL     = [37, 99, 235];   // indigo-600
  const AZUL_OS  = [30, 64, 175];   // indigo-800
  const GRIS     = [107, 114, 128]; // gray-500
  const GRIS_CL  = [243, 244, 246]; // gray-100
  const ROJO     = [220, 38, 38];   // red-600
  const VERDE    = [22, 163, 74];   // green-600
  const BLANCO   = [255, 255, 255];

  let y = 0; // cursor vertical

  // ── 1. BLOQUE DE ENCABEZADO ───────────────────────────────────────────────
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, 210, 42, 'F');

  // Logo / ícono simulado (círculo blanco)
  doc.setFillColor(...BLANCO);
  doc.circle(MARGEN + 7, 14, 7, 'F');
  doc.setTextColor(...AZUL_OS);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SR', MARGEN + 4.2, 16.5);

  // Título institucional
  doc.setTextColor(...BLANCO);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartRecall AI', MARGEN + 17, 13);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Ficha Pedagógica Oficial — Reporte de Rendimiento', MARGEN + 17, 20);

  // Fecha de emisión (esquina derecha)
  const fechaEmision = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.setFontSize(8);
  doc.text(`Fecha de emisión: ${fechaEmision}`, 210 - MARGEN, 13, { align: 'right' });

  y = 50;

  // ── 2. METADATOS DEL ESTUDIANTE ───────────────────────────────────────────
  doc.setFillColor(...GRIS_CL);
  doc.roundedRect(MARGEN, y, ANCHO, 28, 3, 3, 'F');

  doc.setTextColor(...AZUL_OS);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Información del Estudiante', MARGEN + 5, y + 8);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  const mazoTitulo = reportData?.mazo?.titulo || '—';
  const autorMazo  = reportData?.mazo?.autor  || '—';

  doc.text(`Alumno:`, MARGEN + 5, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name || '—', MARGEN + 28, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Email:`, MARGEN + 5, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(student.email || '—', MARGEN + 28, y + 22);

  // Columna derecha
  doc.setFont('helvetica', 'normal');
  doc.text(`Mazo evaluado:`, MARGEN + 90, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(mazoTitulo, MARGEN + 122, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Creado por:`, MARGEN + 90, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(autorMazo, MARGEN + 122, y + 22);

  y += 36;

  // ── 3. BLOQUE ANALÍTICO ───────────────────────────────────────────────────
  doc.setTextColor(...AZUL_OS);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bloque Analítico', MARGEN, y);
  y += 6;

  // Separador
  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.5);
  doc.line(MARGEN, y, MARGEN + ANCHO, y);
  y += 6;

  if (reportData) {
    const { progreso, rendimiento } = reportData;
    const consolidadas = progreso?.consolidadas ?? 0;
    const totales      = progreso?.totales      ?? 0;
    const tasaAcierto  = rendimiento?.tasaAcierto ?? 0;
    const constancia   = rendimiento?.constancia  ?? 0;
    const porcentajeProg = totales > 0 ? Math.round((consolidadas / totales) * 100) : 0;

    // Tarjeta Progreso Consolidado
    doc.setFillColor(240, 253, 244); // green-50
    doc.roundedRect(MARGEN, y, ANCHO / 2 - 3, 36, 3, 3, 'F');

    doc.setTextColor(...VERDE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('✔  PROGRESO CONSOLIDADO', MARGEN + 4, y + 8);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${consolidadas} / ${totales}`, MARGEN + 4, y + 22);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('tarjetas asimiladas', MARGEN + 4, y + 29);

    // Barra de progreso
    const barW = ANCHO / 2 - 12;
    doc.setFillColor(209, 250, 229);
    doc.roundedRect(MARGEN + 4, y + 31, barW, 3, 1, 1, 'F');
    doc.setFillColor(...VERDE);
    doc.roundedRect(MARGEN + 4, y + 31, barW * (porcentajeProg / 100), 3, 1, 1, 'F');

    // Tarjeta Tasa de Acierto
    const cx = MARGEN + ANCHO / 2 + 3;
    doc.setFillColor(239, 246, 255); // blue-50
    doc.roundedRect(cx, y, ANCHO / 2 - 3, 36, 3, 3, 'F');

    doc.setTextColor(...AZUL);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('◎  RENDIMIENTO', cx + 4, y + 8);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${tasaAcierto}%`, cx + 4, y + 22);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tasa de acierto`, cx + 4, y + 29);

    doc.setTextColor(...GRIS);
    doc.setFontSize(8);
    doc.text(`Constancia de estudio: ${constancia}%`, cx + 4, y + 34);

    y += 44;

  } else {
    // Caso sin reportData: aviso genérico
    doc.setTextColor(...GRIS);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'italic');
    doc.text('No se han registrado sesiones de estudio para este mazo aún.', MARGEN, y + 6);
    y += 18;
  }

  // ── 4. PLAN REMEDIAL (ALERTAS) ────────────────────────────────────────────
  doc.setTextColor(...AZUL_OS);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Plan Remedial — Alertas Pedagógicas', MARGEN, y);
  y += 6;

  doc.setDrawColor(...ROJO);
  doc.line(MARGEN, y, MARGEN + ANCHO, y);
  y += 7;

  const alertas = reportData?.alertas ?? [];

  if (alertas.length === 0) {
    // Sin alertas → excelente desempeño
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(MARGEN, y, ANCHO, 16, 3, 3, 'F');
    doc.setTextColor(...VERDE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('✔  Sin tarjetas críticas — Excelente desempeño del estudiante', MARGEN + 5, y + 10);
    y += 24;
  } else {
    alertas.forEach((alerta, idx) => {
      // Fondo alternado
      doc.setFillColor(idx % 2 === 0 ? 254 : 255, idx % 2 === 0 ? 242 : 255, idx % 2 === 0 ? 242 : 255);
      doc.roundedRect(MARGEN, y, ANCHO, 22, 2, 2, 'F');

      // Número de alerta
      doc.setFillColor(...ROJO);
      doc.circle(MARGEN + 6, y + 8, 4.5, 'F');
      doc.setTextColor(...BLANCO);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}`, MARGEN + 6, y + 10.5, { align: 'center' });

      // Pregunta
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      const preguntaTrunc = alerta.pregunta?.length > 75
        ? alerta.pregunta.substring(0, 75) + '...'
        : alerta.pregunta || `Tarjeta ${idx + 1}`;
      doc.text(preguntaTrunc, MARGEN + 14, y + 9);

      // Diagnóstico
      doc.setTextColor(...ROJO);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Diagnóstico: ${alerta.fallas_sugeridas || '—'}   |   EF: ${alerta.easiness_factor ?? '—'}`,
        MARGEN + 14, y + 16
      );

      y += 28;

      // Salto de página si es necesario
      if (y > 260 && idx < alertas.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
  }

  // ── 5. PIE DE PÁGINA ──────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...AZUL_OS);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('SmartRecall AI  •  Documento generado automáticamente para uso institucional', MARGEN, 292);
    doc.text(`Página ${p} / ${totalPages}`, 210 - MARGEN, 292, { align: 'right' });
  }

  // ── 6. DESCARGA ───────────────────────────────────────────────────────────
  const nombreArchivo = `Ficha_Pedagogica_${student.name?.replace(/\s+/g, '_') ?? 'Estudiante'}.pdf`;
  doc.save(nombreArchivo);
};
