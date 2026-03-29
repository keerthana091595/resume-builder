/**
 * Utils.tsx
 * - downloadWordDoc        → generates a real binary .docx using the `docx` npm library
 *
 * Install once:  npm install docx
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  LineRuleType,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";

/* ================================================================
   DOCX CONSTANTS
================================================================ */
const BLUE = "2F5496";
const MARGIN = 720; // 0.5 inch in DXA

/* ================================================================
   INLINE TEXT PARSER — converts **bold** markers → TextRun[]
================================================================ */
function parseInline(
  raw: string,
  baseSize = 20,
  baseColor = "000000"
): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) {
      runs.push(
        new TextRun({
          text: raw.slice(last, m.index),
          font: "Arial",
          size: baseSize,
          color: baseColor,
        })
      );
    }
    runs.push(
      new TextRun({
        text: m[1],
        bold: true,
        font: "Arial",
        size: baseSize,
        color: baseColor,
      })
    );
    last = m.index + m[0].length;
  }

  if (last < raw.length) {
    runs.push(
      new TextRun({
        text: raw.slice(last),
        font: "Arial",
        size: baseSize,
        color: baseColor,
      })
    );
  }

  return runs.length
    ? runs
    : [new TextRun({ text: "", font: "Arial", size: baseSize, color: baseColor })];
}

/* ================================================================
   PARAGRAPH BUILDERS
================================================================ */

/** Name — large, centered, blue, bold */
function nameParagraph(name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({
        text: name,
        bold: true,
        font: "Arial",
        size: 32, // 16pt
        color: BLUE,
      }),
    ],
  });
}

/** Contact line — centered, 10pt */
function contactParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({ text, font: "Arial", size: 20, color: "000000" }),
    ],
  });
}

/** Section header — ALL CAPS, blue, bold, with bottom border rule */
function sectionHeader(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: BLUE,
        space: 1,
      },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        font: "Arial",
        size: 22, // 11pt
        color: BLUE,
      }),
    ],
  });
}

/** Company header row: "COMPANY | ROLE" left, "DATE" right — uses tab stop */
function companyHeaderTable(
  companyRole: string,
  date: string
): Paragraph {
  // Use explicit DXA position = content width (page 12240 - left margin 720 - right margin 720 = 10800)
  return new Paragraph({
    spacing: { before: 80, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
    children: [
      new TextRun({
        text: companyRole,
        bold: true,
        font: "Arial",
        size: 22,
        color: "000000",
      }),
      new TextRun({
        text: "\t" + date,
        bold: true,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
    ],
  });
}

/** "KEY RESPONSIBILITIES:" label */
function keyResponsibilitiesLabel(): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 20 },
    children: [
      new TextRun({
        text: "KEY RESPONSIBILITIES:",
        bold: true,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
    ],
  });
}

/** Bullet point using docx numbering (no unicode bullets) */
function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: "resume-bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 276 },
    contextualSpacing: true,
    children: parseInline(text, 20, "000000"),
  });
}

/** Summary bullet (lines starting with •) */
function summaryBulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: "resume-bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 276 },
    contextualSpacing: true,
    children: parseInline(text, 20, "000000"),
  });
}

/** PROJECT DESCRIPTION paragraph */
function projectDescParagraph(text: string): Paragraph {
  // text already has the "PROJECT DESCRIPTION: ..." label stripped — we re-add as bold
  const colonIdx = text.indexOf(":");
  const label = colonIdx >= 0 ? text.slice(0, colonIdx) : "PROJECT DESCRIPTION";
  const body = colonIdx >= 0 ? text.slice(colonIdx + 1).trim() : text;

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 40, after: 20 },
    children: [
      new TextRun({
        text: label + ": ",
        bold: true,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
      ...parseInline(body, 20, "000000"),
    ],
  });
}

/** TECH STACK line — "TECH STACK:" bold prefix + inline **bold** sub-labels parsed */
function techStackParagraph(raw: string): Paragraph {
  // raw = "TECH STACK: **Languages:** Java | **Frameworks:** Spring..."
  // Split off the "TECH STACK: " prefix, keep the rest for inline parsing
  const colonIdx = raw.indexOf(":");
  const prefix = colonIdx >= 0 ? raw.slice(0, colonIdx + 1).trim() : "TECH STACK:";
  const body = colonIdx >= 0 ? raw.slice(colonIdx + 1).trim() : raw;

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 10, after: 20 },
    children: [
      new TextRun({
        text: prefix + " ",
        bold: true,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
      ...parseInline(body, 20, "000000"),
    ],
  });
}

/** Skill line — bold label left, tab-aligned colon, value aligned; wrapped lines indent under value */
function skillParagraph(label: string, value: string): Paragraph {
  // COLON_TAB: where ":" sits (~2.2in); VALUE_TAB: where value text starts (~2.45in)
  // indent.left = VALUE_TAB + hanging = VALUE_TAB so first line starts at 0 (label),
  // and any wrapped continuation lines start directly under the value text.
  const COLON_TAB = 3168; // ~2.2in in DXA
  const VALUE_TAB = 3528; // ~2.45in in DXA
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 80 },
    tabStops: [
      { type: TabStopType.LEFT, position: COLON_TAB },
      { type: TabStopType.LEFT, position: VALUE_TAB },
    ],
    indent: { left: VALUE_TAB, hanging: VALUE_TAB },
    children: [
      new TextRun({
        text: label,
        bold: true,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
      new TextRun({
        text: "\t:\t",
        font: "Arial",
        size: 20,
        color: "000000",
      }),
      new TextRun({
        text: value,
        font: "Arial",
        size: 20,
        color: "000000",
      }),
    ],
  });
}

/** Regular paragraph (fallback / education lines) */
function regularParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 20 },
    children: parseInline(text, 20, "000000"),
  });
}

/** Small spacer */
function spacer(): Paragraph {
  return new Paragraph({
    children: [new TextRun("")],
    spacing: { before: 0, after: 0 },
  });
}

/** Half-size spacer — used between bullet list and TECH STACK */
function halfSpacer(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: "", size: 1 })],
    spacing: { before: 0, after: 0, line: 120, lineRule: LineRuleType.EXACT },
  });
}

/* ================================================================
   MARKDOWN → docx Paragraph / Table array
================================================================ */
const SKILL_LABELS = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Cloud & Infrastructure",
  "DevOps & CI/CD",
  "Databases & Messaging",
  "Testing & Observability",
];

function markdownToDocxChildren(markdown: string): Paragraph[] {
  const children: Paragraph[] = [];
  const lines = markdown.split("\n");

  let lastType = ""; // track last emitted element to selectively suppress blank lines

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Blank line — swallow only after specific elements to avoid unwanted gaps
    if (!trimmed) {
      if (
        lastType === "contact" ||
        lastType === "name" ||
        lastType === "section"
      ) {
        continue;
      }
      // Look ahead to next non-empty line — use halfSpacer only before TECH STACK
      const nextLine = lines.slice(i + 1).find(l => l.trim() !== "")?.trim() ?? "";
      children.push(/^TECH STACK:/i.test(nextLine) ? halfSpacer() : spacer());
      lastType = "spacer";
      continue;
    }

    // Skip horizontal rules
    if (trimmed === "---") continue;

    // ── Name ──────────────────────────────────────────────────
    if (/^KEERTHANA HARIHARAN$/.test(trimmed)) {
      children.push(nameParagraph(trimmed));
      lastType = "name";
      continue;
    }

    // ── Contact line ──────────────────────────────────────────
    if (/^\d{10}/.test(trimmed) || /^\+1/.test(trimmed) || trimmed.includes("@")) {
      children.push(contactParagraph(trimmed));
      lastType = "contact";
      continue;
    }

    // ── KEY RESPONSIBILITIES ───────────────────────────────────
    if (/^KEY RESPONSIBILITIES:/i.test(trimmed)) {
      children.push(keyResponsibilitiesLabel());
      lastType = "other";
      continue;
    }

    // ── PROJECT DESCRIPTION ───────────────────────────────────
    if (/^PROJECT DESCRIPTION:/i.test(trimmed)) {
      children.push(projectDescParagraph(trimmed));
      lastType = "other";
      continue;
    }

    // ── TECH STACK line ───────────────────────────────────────
    if (/^TECH STACK:/i.test(trimmed)) {
      children.push(techStackParagraph(trimmed));
      lastType = "techstack";
      continue;
    }

    // ── Technical Skill label lines ───────────────────────────
    const skillMatch = trimmed.match(/^\*{0,2}([^:]+):\*{0,2}\s*(.*)/s);
    if (skillMatch && SKILL_LABELS.some((l) => skillMatch[1].trim() === l)) {
      const label = skillMatch[1].trim();
      const value = skillMatch[2]
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*/g, "")
        .trim();
      children.push(skillParagraph(label, value));
      lastType = "skill";
      continue;
    }

    // ── Company header: ALL-CAPS with pipes ───────────────────
    // e.g. "FLORIDA BLUE | SENIOR SOFTWARE ENGINEER | MAY 2023 – PRESENT"
    if (trimmed.includes("|") && trimmed === trimmed.toUpperCase()) {
      const parts = trimmed.split("|").map((p) => p.trim());
      if (parts.length >= 3) {
        const companyRole = parts[0] + " | " + parts[1];
        const date = parts.slice(2).join(" | ");
        children.push(companyHeaderTable(companyRole, date));
        lastType = "other";
        continue;
      }
    }

    // ── ALL-CAPS section header (no pipe) ─────────────────────
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      !/^\d/.test(trimmed) &&
      !trimmed.includes("|")
    ) {
      children.push(sectionHeader(trimmed));
      lastType = "section";
      continue;
    }

    // ── Hyphen bullet  "- text" ───────────────────────────────
    if (trimmed.startsWith("- ")) {
      children.push(bulletParagraph(trimmed.slice(2).trim()));
      lastType = "bullet";
      continue;
    }

    // ── Summary bullet  "• text" ──────────────────────────────
    if (trimmed.startsWith("•")) {
      children.push(summaryBulletParagraph(trimmed.slice(1).trim()));
      lastType = "bullet";
      continue;
    }

    // ── Fallback regular paragraph ────────────────────────────
    children.push(regularParagraph(trimmed));
    lastType = "other";
  }

  return children;
}

/* ================================================================
   downloadWordDoc  — generates a real binary .docx file
================================================================ */
export async function downloadWordDoc(
  generatedResume: string,
  isJD: boolean,
  targetRole: string
): Promise<void> {
  const children = markdownToDocxChildren(generatedResume);

  const doc = new Document({
    // Bullet numbering config
    numbering: {
      config: [
        {
          reference: "resume-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 360, hanging: 180 },
                  spacing: { before: 0, after: 0 }, // no gap between bullets
                },
                run: {
                  font: "Arial",
                  size: 20,
                },
              },
            },
          ],
        },
      ],
    },

    // Global default styles
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 20, // 10pt
            color: "000000",
          },
          paragraph: {
            spacing: { line: 276 }, // ~1.15 line spacing
          },
        },
      },
      paragraphStyles: [
        {
          // Override Word's built-in "List Paragraph" style which adds 8pt after spacing
          // This is what Word applies to all bulleted paragraphs by default
          id: "ListParagraph",
          name: "List Paragraph",
          basedOn: "Normal",
          quickFormat: false,
          paragraph: {
            spacing: { before: 0, after: 0, line: 276 },
            contextualSpacing: true, // collapse spacing between same-style paragraphs
            indent: { left: 360, hanging: 180 },
          },
          run: {
            font: "Arial",
            size: 20,
          },
        },
      ],
    },

    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240,  // 8.5in
              height: 15840, // 11in
            },
            margin: {
              top: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
              right: MARGIN,
            },
          },
        },
        children,
      },
    ],
  });

  // Generate binary blob and trigger download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Keerthana_H_${isJD ? "JD" : "Tool"}_${targetRole.replace(
    /[^a-z0-9]/gi,
    "_"
  )}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
