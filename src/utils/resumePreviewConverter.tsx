/* ================================================================
   HTML CONVERTER  (used by ResumePreview — keep intact)
================================================================ */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      // Look ahead — use a smaller spacer before TECH STACK to match docx behaviour
      const nextLine = lines.slice(i + 1).find(l => l.trim() !== "")?.trim() ?? "";
      if (/^TECH STACK:/i.test(nextLine)) {
        output.push('<p style="margin:0;padding:0;line-height:0;font-size:2pt;">&nbsp;</p>');
      } else {
        output.push('<p style="margin:0;padding:0;line-height:0;font-size:4pt;">&nbsp;</p>');
      }
      continue;
    }

    const escaped = trimmed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (escaped === "---") continue;

    // Name
    if (/^KEERTHANA HARIHARAN$/.test(escaped)) {
      output.push(
        `<p style="font-size:16pt;text-align:center;mso-text-align:center;font-weight:bold;font-family:Arial;color:#2F5496;margin:0 0 2pt 0;">${escaped}</p>`
      );
      continue;
    }

    // Contact
    if (/^2068228191/.test(escaped) || /^\+1/.test(escaped)) {
      output.push(
        `<p style="font-size:10pt;text-align:center;mso-text-align:center;font-family:Arial;color:#000;margin:0 0 4pt 0;">${escaped}</p>`
      );
      continue;
    }

    // KEY RESPONSIBILITIES
    if (/^KEY RESPONSIBILITIES:/i.test(escaped)) {
      output.push(
        `<p style="font-size:10pt;font-weight:bold;font-family:Arial;color:#000;margin:2pt 0 1pt 0;text-transform:uppercase;letter-spacing:0.5pt;">${escaped}</p>`
      );
      continue;
    }

    // Section headers (ALL CAPS, no pipe)
    if (
      escaped === escaped.toUpperCase() &&
      escaped.length > 3 &&
      !/^\d/.test(escaped) &&
      !escaped.includes("|")
    ) {
      output.push(
        `<p style="font-size:11pt;font-weight:bold;font-family:Arial;color:#2F5496;border-bottom:1pt solid #2F5496;margin:6pt 0 2pt 0;padding-bottom:1pt;">${escaped}</p>`
      );
      continue;
    }

    // Company headers with dates
    if (escaped.includes("|") && escaped.toUpperCase() === escaped) {
      const parts = escaped.split("|").map((p) => p.trim());
      if (parts.length >= 3) {
        output.push(`<table style="width:100%;border:none;margin:4pt 0 1pt 0;border-collapse:collapse;">
          <tr>
            <td style="font-size:11pt;font-weight:bold;font-family:Arial;color:#000;border:none;padding:0;">${parts[0]} | ${parts[1]}</td>
            <td style="font-size:10pt;font-weight:bold;font-family:Arial;color:#000;text-align:right;border:none;padding:0;">${parts.slice(2).join(" | ")}</td>
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
        const content = match[2].replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );
        output.push(
          `<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;text-align:justify;"><strong>${label}:</strong> ${content}</p>`
        );
      }
      continue;
    }

    // Technical Skills — tab-aligned colon layout matching screenshot
    const skillLabels = [
      "Programming Languages",
      "Frameworks & Libraries",
      "Cloud & Infrastructure",
      "DevOps & CI/CD",
      "Databases & Messaging",
      "Testing & Observability",
    ];
    const skillMatch = trimmed.match(/^\*{0,2}([^:]+):\*{0,2}\s*(.*)/s);
    if (skillMatch && skillLabels.some((l) => skillMatch[1].trim() === l)) {
      const label = skillMatch[1].trim();
      const plainContent = skillMatch[2]
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*/g, "");
      // Two-column layout: bold label | colon | value — mirrors docx tab-stop design
      output.push(
        `<table style="width:100%;border:none;margin:1pt 0;border-collapse:collapse;font-family:Arial;font-size:10pt;color:#000;">
          <tr>
            <td style="font-weight:bold;width:2.2in;vertical-align:top;border:none;padding:0 0 0 0;white-space:nowrap;">${label}</td>
            <td style="vertical-align:top;border:none;padding:0 6pt 0 6pt;white-space:nowrap;">:</td>
            <td style="vertical-align:top;border:none;padding:0;text-align:justify;line-height:1.3;">${plainContent}</td>
          </tr>
        </table>`
      );
      continue;
    }

    // Bullets
    if (trimmed.startsWith("- ")) {
      const content = trimmed
        .substring(2)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      output.push(
        `<p style="font-size:10pt;font-family:Arial;color:#000;margin:0 0 1pt 0;margin-left:0.3in;text-indent:-0.15in;line-height:1.3;text-align:justify;mso-list:none;">&#8226;&nbsp;&nbsp;${content}</p>`
      );
      continue;
    }

    // Summary bullets
    if (trimmed.startsWith("•")) {
      const content = trimmed
        .substring(1)
        .trim()
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      output.push(
        `<p style="font-size:10pt;font-family:Arial;color:#000;margin:0 0 1pt 0;margin-left:0.3in;text-indent:-0.15in;line-height:1.3;text-align:justify;mso-list:none;">&#8226;&nbsp;&nbsp;${content}</p>`
      );
      continue;
    }

    // Regular paragraph
    const processed = trimmed.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    output.push(
      `<p style="font-size:10pt;font-family:Arial;color:#000;margin:1pt 0;line-height:1.3;text-align:justify;">${processed}</p>`
    );
  }

  return output.join("\n");
}