import PDFDocument from 'pdfkit';

/**
 * Builds a CBC Scheme of Work PDF
 */
export function buildSchemePdf({ scheme, lessons }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // ===== HEADER =====
  doc
    .fontSize(16)
    .text('SCHEME OF WORK', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .text(`School: ${scheme.school}`)
    .text(`Learning Area: ${scheme.learning_area}`)
    .text(`Grade: ${scheme.grade}`)
    .text(`Term: ${scheme.term}    Year: ${scheme.year}`)
    .moveDown();

  // ===== TABLE HEADER =====
  doc.fontSize(9).text(
    'Week | Lesson | Strand | Substrand',
    { underline: true }
  );

  doc.moveDown(0.5);

  // ===== TABLE ROWS =====
  lessons.forEach(l => {
    doc.text(
      `${l.week} | ${l.lesson} | ${l.strand} | ${l.substrand}`
    );
  });

  doc.end();

  return doc;
}
