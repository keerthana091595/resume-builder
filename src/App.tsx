/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Briefcase, FileText, Copy, Check, Cpu,
  AlertCircle, ChevronDown, Save, RefreshCw,
  Download, File, Layers, ToggleLeft, ToggleRight
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

import { buildJDSystem, buildJDUser } from "./utils/JDPrompt";
import { buildToolSystem, buildToolUser } from "./utils/ToolJDPrompt";
import { ResumePreview } from "./components/ResumePreview";
import { convertMarkdownToHtml } from "./utils/Utils";
import Header from "./components/Header";

export default function App() {

  const [mode, setMode] = useState("jd");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [domainInstructions, setDomainInstructions] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDL, setShowDL] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);

  const isJD = mode === "jd";

  const handleCopy = () => {
    if (!generatedResume) return;
    const html = convertMarkdownToHtml(generatedResume);
    const d = document.createElement("div");
    d.contentEditable = "true";
    d.innerHTML = html;
    d.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(d);
    const r = document.createRange();
    r.selectNodeContents(d);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Copy failed", e);
    }
    document.body.removeChild(d);
    s?.removeAllRanges();
  };

  const handlePDF = () => {
    window.print();
    setShowDL(false);
  };

  const handleWord = () => {
    if (!generatedResume) return;
    const body = convertMarkdownToHtml(generatedResume);
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>Resume - Keerthana Hariharan</title>
    <style>
    @page { margin: 1.27cm; }
    body{font-family:Arial;font-size:10pt;color:#000;margin:0;}
    h1{font-size:16pt;text-align:center;font-weight:bold;font-family:Arial;color:#000;}
    h2{font-size:11pt;font-weight:bold;border-bottom:2px solid #2F5496;color:#2F5496;font-family:Arial;}
    p{font-family:Arial;line-height:1.3;margin:0;padding:0;}
    hr{border:none;border-top:1px solid #2F5496;}
    </style>
    </head><body>${body}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Keerthana_H_${isJD ? "JD" : "Tool"}_${targetRole.replace(/[^a-z0-9]/gi, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowDL(false);
  };

  const generate = async () => {
    setError("");
    if (!targetRole.trim()) {
      setError("Please enter the Target Role Title.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the Job Description.");
      return;
    }

    setIsGenerating(true);
    setGeneratedResume("");

    // 1. Reset and Start
    setResetTimer(prev => prev + 1);
    setIsTimerActive(true);

    // ===== FORCE MODE DETECTION - READ ONCE =====
    const currentMode = mode;  // Capture mode once
    const currentIsJD = currentMode === "jd";

    console.log("=== GENERATION STARTED ===");
    console.log("Current Mode:", currentMode);
    console.log("Is JD Mode?", currentIsJD);

    // Build prompts ONCE using the captured mode
    const systemPrompt = currentIsJD ? buildJDSystem() : buildToolSystem();
    const userPrompt = currentIsJD ? buildJDUser(targetRole, jobDescription, domainInstructions) : buildToolUser(targetRole, jobDescription, domainInstructions);

    console.log("System Prompt starts with:", systemPrompt.substring(0, 150));
    console.log("User Prompt includes 'EXACTLY 20 bullets'?", userPrompt.includes("EXACTLY 20"));
    console.log("User Prompt includes 'EXACTLY 30 bullets'?", userPrompt.includes("EXACTLY 30"));
    console.log("System includes 'TOOL MODE'?", systemPrompt.includes("TOOL MODE"));
    console.log("System includes 'JD MODE'?", systemPrompt.includes("JD MODE"));
    // ===== END DEBUG =====

    try {
      setIsTimerActive(true);
      const ai = new GoogleGenAI({ apiKey: "AIzaSyA0MpxYHWGeTs0O-Axbd1cWEZi_xgLt22s" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [{
            text: isJD
              ? buildJDUser(targetRole, jobDescription, domainInstructions)
              : buildToolUser(targetRole, jobDescription, domainInstructions)
          }]
        }],
        config: {
          systemInstruction: isJD ? buildJDSystem() : buildToolSystem(),
          temperature: 0.7
        }
      });

      const text = response.text;
      if (text) {
        // ===== ADD BULLET COUNT VERIFICATION HERE =====
        console.log("=== VERIFYING BULLET COUNTS ===");

        // Count actual bullets in Florida Blue section
        const fbMatch = text.match(/FLORIDA BLUE.*?KEY RESPONSIBILITIES:(.*?)(?:TECH STACK:|CRATE AND BARREL)/s);
        if (fbMatch) {
          const fbBullets = (fbMatch[1].match(/^[-•]\s/gm) || []).length;
          console.log("Florida Blue bullet count:", fbBullets);
          console.log("Expected for", mode, "mode:", mode === "jd" ? 30 : 20);

          if (mode === "jd" && fbBullets !== 30) {
            console.warn("⚠️ WARNING: JD mode should have 30 bullets, but got", fbBullets);
          }
          if (mode === "tool" && fbBullets !== 20) {
            console.warn("⚠️ WARNING: Tool mode should have 20 bullets, but got", fbBullets);
          }
        }
        // ===== END VERIFICATION =====
        setGeneratedResume(text);
      } else {
        throw new Error("No response. Check API key or quota.");
      }
    } catch (e) {
      setError(e.message || "Generation failed. Check your API key.");
    } finally {
      setIsTimerActive(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}} 
        @media print{
          .no-print{display:none!important} 
          @page{margin:0.5in} 
          body{background:white!important}
        } 
        ::-webkit-scrollbar{width:6px} 
        ::-webkit-scrollbar-track{background:#1e293b} 
        ::-webkit-scrollbar-thumb{background:#3b82f6;border-radius:3px}
      `}</style>

      <Header isGenerating={isGenerating} isJD={isJD} setMode={setMode} setGeneratedResume={setGeneratedResume} setError={setError} isRunning={isTimerActive} resetKey={resetTimer} />

      <div className="no-print px-6 py-2 text-xs bg-slate-950 border-b border-slate-800 text-slate-400">
        {isJD
          ? "📋 JD Mode — 30/30/20/15 bullets · Only tools from projects · 10 bullets summary"
          : "🔧 Tool Mode — 20/15/10/10 bullets · Only tools from projects · 10 bullets summary"}
      </div>

      <main className="flex flex-1 overflow-hidden">
        <div className="no-print w-80 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">

          <div>
            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-blue-400">
                <Cpu size={14} /> Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full p-3 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-blue-400">
                <FileText size={14} /> Job Description (JD)
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full JD here..."
                className="w-full p-3 rounded-lg text-sm text-slate-300 bg-slate-800 border border-slate-700 h-44 resize-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400">
                <Layers size={14} /> Domain / Client Instructions
              </label>
              <textarea
                value={domainInstructions}
                onChange={e => setDomainInstructions(e.target.value)}
                placeholder="e.g. Florida Blue: Java/Spring. Crate And Barrel: Python."
                className="w-full p-3 rounded-lg text-sm text-slate-300 bg-slate-800 border border-emerald-700/50 h-28 resize-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="mb-5 p-4 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-400 leading-relaxed">
              <p className="font-bold mb-2 text-blue-400">
                {isJD ? "JD Mode — 30/30/20/15" : "Tool Mode — 20/15/10/10"}
              </p>
              <p>• Florida Blue — {isJD ? "30 bullets · GCP" : "20 bullets · Senior SE"}</p>
              <p>• Crate And Barrel — {isJD ? "30 bullets · Azure" : "15 bullets · Senior SE"}</p>
              <p>• US Foods — {isJD ? "20 bullets · AWS" : "10 bullets · SE"}</p>
              <p>• Sixbase — {isJD ? "15 bullets · On-Prem" : "10 bullets · Assoc SE"}</p>
            </div>

            <button
              onClick={generate}
              disabled={isGenerating || !targetRole || !jobDescription}
              className={`w-full py-4 rounded-lg font-bold text-sm flex justify-center items-center gap-2 shadow-lg transition-all ${isGenerating || !targetRole || !jobDescription
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer hover:from-blue-500 hover:to-indigo-500 active:scale-95"
                }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Generate ({isJD ? "JD" : "Tool"})</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 flex gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-slate-950">
          {generatedResume && (
            <div className="no-print absolute top-5 right-6 flex gap-2 z-20">
              <div className="relative">
                <button
                  onClick={() => setShowDL(!showDL)}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download</span>
                  <ChevronDown size={13} />
                </button>

                {showDL && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
                    <button
                      onClick={handlePDF}
                      className="w-full px-4 py-3 text-left flex items-center gap-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <FileText size={15} className="text-red-400" />
                      Save as PDF
                    </button>
                    <button
                      onClick={handleWord}
                      className="w-full px-4 py-3 text-left flex items-center gap-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-t border-slate-700 bg-transparent cursor-pointer"
                    >
                      <File size={15} className="text-blue-400" />
                      Download Word (.doc)
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleCopy}
                className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm shadow-lg transition-all cursor-pointer ${copied
                  ? "bg-emerald-600 border border-emerald-500 text-white"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 bg-slate-900/30">
            <div className="max-w-4xl mx-auto">
              {generatedResume ? (
                <div className="bg-white text-black p-12 shadow-2xl rounded-sm min-h-[1100px] print:shadow-none print:p-0">
                  <ResumePreview text={generatedResume} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[500px] opacity-30">
                  <FileText size={90} className="text-blue-500 mb-4" />
                  <p className="text-xl font-semibold text-slate-500">
                    Resume Output Will Appear Here
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Fill inputs → Generate ({isJD ? "JD" : "Tool"})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}