import PDFDocument from "pdfkit";

/** Structured content shared by the PDF download. Tests assert prompts here. */
export const kitSections = (kit) => {
  const sections = [
    {
      type: "title",
      text: `${kit.title}: ${kit.subtitle}`,
    },
    {
      type: "meta",
      text: `Oleh Riza Fahmi · Diperbarui ${kit.updated}`,
    },
    {
      type: "link",
      text: "https://rizafahmi.com/vibe-coding/",
    },
    { type: "paragraph", text: kit.description },
    { type: "heading", level: 1, text: "Sebelum mulai" },
    ...kit.prerequisites.flatMap((item) => [
      { type: "heading", level: 2, text: item.title },
      { type: "paragraph", text: item.text },
    ]),
    { type: "heading", level: 1, text: "Cara memakai panduan ini" },
    {
      type: "list",
      items: kit.howTo,
    },
    { type: "heading", level: 1, text: "Istilah singkat" },
    ...kit.glossary.map((item) => ({
      type: "definition",
      term: item.term,
      meaning: item.meaning,
    })),
  ];

  for (const stage of kit.stages) {
    sections.push({
      type: "heading",
      level: 1,
      text: `${stage.number}. ${stage.title}`,
    });
    sections.push({ type: "paragraph", text: stage.description });
    for (const step of stage.steps) {
      sections.push({
        type: "heading",
        level: 2,
        text: `${step.number}. ${step.title}`,
      });
      sections.push({
        type: "paragraph",
        text: `Tempel di: ${step.tool}`,
      });
      sections.push({
        type: "paragraph",
        text: `Siapkan: ${step.input}`,
      });
      sections.push({
        type: "heading",
        level: 3,
        text: "Pakai ide saya",
      });
      sections.push({ type: "prompt", text: step.prompt });
      sections.push({
        type: "heading",
        level: 3,
        text: "Ikuti SlideQR",
      });
      sections.push({ type: "prompt", text: step.examplePrompt });
      sections.push({
        type: "paragraph",
        text: `Hasil yang dicari: ${step.output}`,
      });
      sections.push({
        type: "paragraph",
        text: `Cek sendiri: ${step.check}`,
      });
      sections.push({
        type: "paragraph",
        text: `Lanjut: ${step.next}`,
      });
    }
  }

  sections.push(
    { type: "heading", level: 1, text: "Butuh pendampingan?" },
    {
      type: "paragraph",
      text: `Sesi privat berbayar selama 90 menit bersama Riza untuk memperjelas ide dan mengerjakan satu target. Isi brief di halaman sesi privat. Saya balas dalam ${kit.responseTime} dengan usulan sesi dan biayanya. Mengirim brief belum berarti memesan sesi.`,
    },
    {
      type: "link",
      text: "https://rizafahmi.com/vibe-coding/private/",
    },
    { type: "heading", level: 1, text: "Panduan setup" },
    {
      type: "list",
      items: kit.sources.map((source) => `${source.label}: ${source.url}`),
    },
  );

  return sections;
};

const MARGIN = 54;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const writeWrapped = (doc, text, { font, size, gap = 8 } = {}) => {
  doc.font(font).fontSize(size);
  doc.text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "left",
  });
  doc.moveDown(gap / 12);
};

/** Build a PDF Buffer of the panduan from the shared kit data. */
export const renderKitPdf = (kit) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: `${kit.title}: ${kit.subtitle}`,
        Author: "Riza Fahmi",
        Subject: kit.description,
      },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    for (const section of kitSections(kit)) {
      switch (section.type) {
        case "title":
          writeWrapped(doc, section.text, { font: "Helvetica-Bold", size: 18, gap: 6 });
          break;
        case "meta":
          writeWrapped(doc, section.text, { font: "Helvetica", size: 10, gap: 2 });
          break;
        case "link":
          writeWrapped(doc, section.text, { font: "Helvetica", size: 10, gap: 10 });
          break;
        case "heading": {
          const sizes = { 1: 14, 2: 12, 3: 11 };
          doc.moveDown(section.level === 1 ? 0.6 : 0.3);
          writeWrapped(doc, section.text, {
            font: "Helvetica-Bold",
            size: sizes[section.level] ?? 11,
            gap: 6,
          });
          break;
        }
        case "paragraph":
          writeWrapped(doc, section.text, { font: "Helvetica", size: 10, gap: 8 });
          break;
        case "definition":
          writeWrapped(doc, `${section.term}: ${section.meaning}`, {
            font: "Helvetica",
            size: 10,
            gap: 6,
          });
          break;
        case "list":
          for (const [index, item] of section.items.entries()) {
            writeWrapped(doc, `${index + 1}. ${item}`, {
              font: "Helvetica",
              size: 10,
              gap: 4,
            });
          }
          doc.moveDown(0.4);
          break;
        case "prompt":
          writeWrapped(doc, section.text, { font: "Courier", size: 8, gap: 10 });
          break;
        default:
          break;
      }
    }

    doc.end();
  });
