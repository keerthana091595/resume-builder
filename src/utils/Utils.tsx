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
      // Minimal gap for blank lines — no visible spacer
      output.push('<p style="margin:0;padding:0;line-height:0;font-size:4pt;">&nbsp;</p>');
      continue;
    }

    const escaped = trimmed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (escaped === '---') continue;

    // Name
    if (/^KEERTHANA HARIHARAN$/.test(escaped)) {
      output.push(`<p style="font-size:16pt;text-align:center;mso-text-align:center;font-weight:bold;font-family:Arial;color:#2F5496;margin:0 0 2pt 0;">${escaped}</p>`);
      continue;
    }

    // Contact
    if (/^2068228191/.test(escaped) || /^\+1/.test(escaped)) {
      output.push(`<p style="font-size:10pt;text-align:center;mso-text-align:center;font-family:Arial;color:#000;margin:0 0 4pt 0;">${escaped}</p>`);
      continue;
    }

    // KEY RESPONSIBILITIES
    if (/^KEY RESPONSIBILITIES:/i.test(escaped)) {
      output.push(`<p style="font-size:10pt;font-weight:bold;font-family:Arial;color:#000;margin:2pt 0 1pt 0;text-transform:uppercase;letter-spacing:0.5pt;">${escaped}</p>`);
      continue;
    }

    // Section headers (ALL CAPS, no pipe)
    if (escaped === escaped.toUpperCase() && escaped.length > 3 && !/^\d/.test(escaped) && !escaped.includes('|')) {
      output.push(`<p style="font-size:11pt;font-weight:bold;font-family:Arial;color:#2F5496;border-bottom:1pt solid #2F5496;margin:6pt 0 2pt 0;padding-bottom:1pt;">${escaped}</p>`);
      continue;
    }

    // Company headers with dates
    if (escaped.includes('|') && escaped.toUpperCase() === escaped) {
      const parts = escaped.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        output.push(`<table style="width:100%;border:none;margin:4pt 0 1pt 0;border-collapse:collapse;">
          <tr>
            <td style="font-size:11pt;font-weight:bold;font-family:Arial;color:#000;border:none;padding:0;">${parts[0]} | ${parts[1]}</td>
            <td style="font-size:10pt;font-weight:bold;font-family:Arial;color:#000;text-align:right;border:none;padding:0;">${parts.slice(2).join(' | ')}</td>
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
        output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;text-align:justify;"><strong>${label}:</strong> ${content}</p>`);
      }
      continue;
    }

    // TECH STACK
    if (/^TECH STACK:/i.test(escaped)) {
      const match = escaped.match(/^(TECH STACK):\s*(.*)$/i);
      if (match) {
        const content = match[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;"><strong>${match[1]}:</strong> ${content}</p>`);
      }
      continue;
    }

    // Technical Skills — label bold, tools always plain text (strip all ** markers from content)
    // Matches both "**Label:** tools" and "Label: tools" formats
    const skillLabels = ['Programming Languages', 'Frameworks & Libraries', 'Cloud & Infrastructure', 'DevOps & CI/CD', 'Databases & Messaging', 'Testing & Observability'];
    const skillMatch = trimmed.match(/^\*{0,2}([^:]+):\*{0,2}\s*(.*)/s);
    if (skillMatch && skillLabels.some(l => skillMatch[1].trim() === l)) {
      const label = skillMatch[1].trim();
      const plainContent = skillMatch[2].replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '');
      output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;"><strong>${label}:</strong> ${plainContent}</p>`);
      continue;
    }

    // Bullets
    if (trimmed.startsWith('- ')) {
      const content = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:0 0 1pt 0;margin-left:0.3in;text-indent:-0.15in;line-height:1.3;text-align:justify;mso-list:none;">&#8226;&nbsp;&nbsp;${content}</p>`);
      continue;
    }

    // Summary bullets (lines starting with • symbol)
    if (trimmed.startsWith('•')) {
      const content = trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:0 0 1pt 0;margin-left:0.3in;text-indent:-0.15in;line-height:1.3;text-align:justify;mso-list:none;">&#8226;&nbsp;&nbsp;${content}</p>`);
      continue;
    }

    // Regular paragraph
    const processed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    output.push(`<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;text-align:justify;">${processed}</p>`);
  }

  return output.join('\n');
}

export const downloadWordDoc = (generatedResume, isJD, targetRole) => {
  const body = convertMarkdownToHtml(generatedResume);
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>Resume - Keerthana Hariharan</title>
    <xml>
      <w:WordDocument>
        <w:View>Normal</w:View>
        <w:Zoom>100</w:Zoom>
      </w:WordDocument>
    </xml>
    <style>
      @page WordSection1 {
        size: 8.5in 11.0in;
        margin-top: 0.4in;
        margin-bottom: 0.4in;
        margin-left: 0.5in;
        margin-right: 0.5in;
        mso-header-margin: 0in;
        mso-footer-margin: 0in;
        mso-paper-source: 0;
      }
      div.WordSection1 { page: WordSection1; }
      body { font-family: Arial; font-size: 10pt; color: #000; margin: 0; padding: 0; }
      p { font-family: Arial; font-size: 10pt; line-height: 1.3; margin: 0; padding: 0; mso-line-height-rule: exactly; }
      table { border-collapse: collapse; width: 100%; }
      td { border: none; padding: 0; }
    </style>
  </head>
  <body>
    <div class="WordSection1">
      ${body}
    </div>
  </body>
  </html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Keerthana_H_${isJD ? "JD" : "Tool"}_${targetRole.replace(/[^a-z0-9]/gi, "_")}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};