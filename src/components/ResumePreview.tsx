import React from 'react';

/* ================================================================
   PREVIEW RENDERER
================================================================ */
export function ResumePreview({ text }) {
  const lines = text.split("\n");
  const out = [];
  let idx = 0;

  for (const raw of lines) {
    idx++;
    const t = raw.trim();
    
    if (!t) {
      out.push(<div key={idx} className="h-2" />);
      continue;
    }

    if (t === "---") continue;

    if (/^KEERTHANA HARIHARAN$/.test(t)) {
      out.push(<h1 key={idx} className="text-center text-2xl font-bold uppercase text-blue-600 mb-1">{t}</h1>); 
      continue;
    }
    
    // Contact info - CENTERED
    if (/^(\+1\s?\(?\d{3}\)?|9412704884)/.test(t)) {
      out.push(<p key={idx} className="text-center text-sm text-gray-700 mb-3">{t}</p>); 
      continue;
    }

    if (/^(PROJECT DESCRIPTION|TECH STACK):/i.test(t)) {
      const match = t.match(/^(PROJECT DESCRIPTION|TECH STACK):\s*(.*)$/i);
      if (match) {
        const label = match[1];
        const content = match[2];
        const segs = content.replace(/\*\*(.*?)\*\*/g, "\x00$1\x00").split("\x00");
        out.push(<p key={idx} className="text-[0.7rem] text-slate-900 mt-1 mb-0.5 leading-tight text-justify">
          <strong>{label}:</strong> {segs.map((s, j) => j % 2 === 1 ? <strong key={j}>{s}</strong> : s)}
        </p>);
      }
      continue;
    }

    if (/^KEY RESPONSIBILITIES:/i.test(t)) {
      out.push(<p key={idx} className="text-[0.7rem] font-bold text-slate-900 mt-1 mb-0.5 uppercase tracking-wide">{t}</p>);
      continue;
    }

    if (t.toUpperCase() === t && t.length > 3 && !/^\d/.test(t) && !t.startsWith("-")) {
      if (t.includes("|")) {
        const parts = t.split("|").map(p => p.trim());
        out.push(<div key={idx} className="flex justify-between items-baseline mt-3 mb-0.5 font-bold text-[0.85rem] text-slate-900 w-full">
          <span>{parts[0]}{parts[1] ? ` | ${parts[1]}` : ""}</span>
          <span className="text-slate-600 font-normal text-[0.75rem]">{parts[2] || ""}</span>
        </div>);
      } else {
        out.push(<h2 key={idx} className="text-blue-600 border-b border-blue-600 text-[0.85rem] font-bold uppercase pb-0.5 mt-4 mb-1.5 w-full">{t}</h2>);
      }
      continue;
    }

    // Technical Skills lines — **Label:** bold, tool content always plain text (strip any ** markers)
    if (t.match(/^\*\*[^:]+:\*\*/)) {
      const labelMatch = t.match(/^\*\*([^:]+):\*\*\s*(.*)/s);
      if (labelMatch) {
        const label = labelMatch[1];
        const plainContent = labelMatch[2].replace(/\*\*(.*?)\*\*/g, "$1");
        out.push(
          <p key={idx} className="text-[0.7rem] text-slate-800 mb-0.5 leading-tight text-justify w-full">
            <strong>{label}:</strong>{" "}{plainContent}
          </p>
        );
      }
      continue;
    }

    // Bullets - MORE INDENTATION
    if (t.startsWith("- ")) {
      const segs = t.slice(2).replace(/\*\*(.*?)\*\*/g, "\x00$1\x00").split("\x00");
      out.push(<div key={idx} className="flex mb-0.5 pl-8 w-full">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 mr-2.5 shrink-0" />
        <p className="text-[0.7rem] text-justify leading-tight text-slate-800 flex-1">
          {segs.map((s, j) => j % 2 === 1 ? <strong key={j} className="font-bold text-slate-950">{s}</strong> : s)}
        </p>
      </div>);
      continue;
    }

    const segs = t.replace(/\*\*(.*?)\*\*/g, "\x00$1\x00").split("\x00");
    out.push(<p key={idx} className="text-[0.7rem] text-slate-800 mb-0.5 text-justify leading-tight w-full">
      {segs.map((s, j) => j % 2 === 1 ? <strong key={j} className="font-bold">{s}</strong> : s)}
    </p>);
  }

  return <>{out}</>;
}
