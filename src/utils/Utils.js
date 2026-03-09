/* ================================================================
   HTML CONVERTER
================================================================ */
export function convertMarkdownToHtml(markdown) {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const output = [];

  for (const line of lines) {
    let trimmed = line.trim();

    if (!trimmed) {
      output.push('<p style="margin:0;padding:0;line-height:0.3em;">&nbsp;</p>');
      continue;
    }

    const escaped = trimmed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (escaped === '---') continue;

    // Name
    if (/^KEERTHANA H$/.test(escaped)) {
      output.push(`<p style="font-size:16pt;text-align:center;font-weight:bold;font-family:Arial;color:#2F5496;margin:0 0 4pt 0;">${escaped}</p>`);
      continue;
    }

    // Contact
    if (/^9412704884/.test(escaped) || /^\+1/.test(escaped)) {
      output.push(`<p style="font-size:10pt;text-align:center;font-family:Arial;color:#000;margin:0 0 8pt 0;">${escaped}</p>`);
      continue;
    }

    // KEY RESPONSIBILITIES
    if (/^KEY RESPONSIBILITIES:/i.test(escaped)) {
      output.push(`<p style="font-size:10pt;font-weight:bold;font-family:Arial;color:#000;margin:2pt 0 2pt 0;text-transform:uppercase;letter-spacing:0.5pt;">${escaped}</p>`);
      continue;
    }

    // Section headers (ALL CAPS)
    if (escaped === escaped.toUpperCase() && escaped.length > 3 && !/^\d/.test(escaped) && !escaped.includes('|')) {
      output.push(`<p style="font-size:11pt;font-weight:bold;font-family:Arial;color:#2F5496;border-bottom:2px solid #2F5496;margin:10pt 0 4pt 0;padding-bottom:2pt;">${escaped}</p>`);
      continue;
    }

    // Company headers with dates
    if (escaped.includes('|') && escaped.toUpperCase() === escaped) {
      const parts = escaped.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        output.push(`<table style="width:100%;border:none;margin:8pt 0 2pt 0;border-collapse:collapse;">
          <tr>
            <td style="font-size:11pt;font-weight:bold;font-family:Arial;color:#000;border:none;padding:0;">${parts[0]} | ${parts[1]}</td>
            <td style="font-size:10pt;font-family:Arial;color:#555;text-align:right;border:none;padding:0;">${parts.slice(2).join(' | ')}</td>
          </tr>
        </table>`);
        continue;
      }
    }

    // PROJECT DESCRIPTION
    if (/^PROJECT DESCRIPTION:/i.test(escaped)) {
      const match = escaped.match(/^(PROJECT DESCRIPTION):\s*(.*)$/i);
      if (match) {
        const label = match[1];
        const content = match[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:2pt 0 2pt 0;line-height:1.3;text-align:justify;"><strong>${label}:</strong> ${content}</p>`);
      }
      continue;
    }

    // TECH STACK
    if (/^TECH STACK:/i.test(escaped)) {
      const match = escaped.match(/^(TECH STACK):\s*(.*)$/i);
      if (match) {
        const content = match[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:2pt 0 2pt 0;"><strong>${match[1]}:</strong> ${content}</p>`);
      }
      continue;
    }

    // Skills categories with bold labels
    if (/^\*\*[^:]+:\*\*/.test(trimmed)) {
      const processed = trimmed.replace(/\*\*([^:]+):\*\*/g, '<strong>$1:</strong>');
      output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;">${processed}</p>`);
      continue;
    }

    // Bullets - INDENTED like preview
    if (trimmed.startsWith('- ')) {
      const content = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:0 0 2pt 0;padding-left:0.15in;line-height:1.3;text-align:justify;">• ${content}</p>`);
      continue;
    }

    // Regular paragraph
    const processed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;text-align:justify;">${processed}</p>`);
  }

  return output.join('\n');
}