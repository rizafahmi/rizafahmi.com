export const renderKitMarkdown = (kit) => {
  const sections = [
    `# ${kit.title}: ${kit.subtitle}`,
    `Oleh Riza Fahmi · Diperbarui ${kit.updated}\n\nhttps://rizafahmi.com/vibe-coding/`,
    kit.description,
    "## Sebelum mulai",
    ...kit.prerequisites.map((item) => `### ${item.title}\n\n${item.text}`),
    "## Cara memakai panduan ini",
    kit.howTo.map((item, index) => `${index + 1}. ${item}`).join("\n"),
    "## Istilah singkat",
    ...kit.glossary.map((item) => `**${item.term}:** ${item.meaning}`),
  ];
  for (const stage of kit.stages) {
    sections.push(`## ${stage.number}. ${stage.title}\n\n${stage.description}`);
    for (const step of stage.steps) {
      sections.push(
        `### ${step.number}. ${step.title}`,
        `**Tempel di:** ${step.tool}\n\n**Siapkan:** ${step.input}`,
        `#### Pakai ide saya\n\n\`\`\`text\n${step.prompt}\n\`\`\``,
        `#### Ikuti SlideQR\n\n\`\`\`text\n${step.examplePrompt}\n\`\`\``,
        `**Hasil yang dicari:** ${step.output}\n\n**Cek sendiri:** ${step.check}\n\n**Lanjut:** ${step.next}`,
      );
    }
  }
  sections.push(
    "## Butuh pendampingan?",
    `Sesi privat berbayar selama 90 menit bersama Riza untuk memperjelas ide dan mengerjakan satu target. Ceritakan project atau kendalamu lewat email. Saya balas dalam ${kit.responseTime} dengan usulan sesi dan biayanya. Mengirim email belum berarti memesan sesi.`,
    `Detail: https://rizafahmi.com/vibe-coding/private/\n\nEmail: ${kit.email}`,
    "## Panduan setup",
    ...kit.sources.map((source) => `- [${source.label}](${source.url})`),
  );
  return `${sections.join("\n\n")}\n`;
};
