import React from 'react';
import { Briefcase, ToggleLeft, ToggleRight } from "lucide-react";
import { Timer } from './Timer';

function Header({ isJD, setMode, setGeneratedResume, setError, isRunning, resetKey, isGenerating }) {
    return (
        <header className="no-print bg-slate-950 border-b border-slate-800 flex justify-between items-center px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                    <Briefcase size={20} color="white" />
                </div>
                <div>
                    <div className="font-bold text-lg text-white">
                        Resume Builder <span className="text-blue-500">— Keerthana Hariharan</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        4 Companies · 9+ Years · GCP & AWS Certified
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Timer isRunning={isRunning} resetKey={resetKey} />
            </div>
            <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${isJD ? "text-blue-500" : "text-slate-500"}`}>
                    JD Mode
                </span>
                <button
                    disabled={isGenerating}
                    onClick={() => {
                        setMode(isJD ? "tool" : "jd");
                        setGeneratedResume("");
                        setError("");
                    }}
                    className="bg-transparent border-none cursor-pointer p-0 flex transition-transform hover:scale-110"
                >
                    {isJD ? (
                        <ToggleLeft size={40} color="#3b82f6" />
                    ) : (
                        <ToggleRight size={40} color="#3b82f6" />
                    )}
                </button>
                <span className={`text-sm font-semibold ${!isJD ? "text-blue-500" : "text-slate-500"}`}>
                    Tool Mode
                </span>

                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isJD
                    ? "bg-blue-900/40 text-blue-400 border border-blue-700"
                    : "bg-indigo-900/40 text-indigo-400 border border-indigo-700"
                    }`}>
                    {isJD ? "JD MODE ACTIVE" : "TOOL MODE ACTIVE"}
                </div>
            </div>
        </header>
    )
}

export default Header;