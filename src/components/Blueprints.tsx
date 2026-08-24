/**
 * Human-Crafted Technical Architecture & System Blueprint Component
 * @license Apache-2.0
 */

import React, { useState } from "react";
import { FAST_API_BLUEPRINT, DEPLOYMENT_GUIDE_CONTENT } from "../data";
import { CodeSnippet } from "../types";
import { Terminal, Database, FileCode, Check, Copy, HardDrive, Cpu, Sparkles } from "lucide-react";

export default function Blueprints() {
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const activeFile: any = FAST_API_BLUEPRINT.files[activeFileIdx] || FAST_API_BLUEPRINT.files[0];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Intro Header */}
      <div className="glass-panel p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reference Production Architecture</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
          FastAPI + PostgreSQL Industrial Production Stack
        </h2>
        <p className="max-w-3xl text-sm text-zinc-400 leading-relaxed">
          While this environment executes rapid evaluations with server-side Node and Gemini architectures, you can replicate this enterprise-grade Python FastAPI, SQLAlchemy 2.0, PostgreSQL, and Docker ecosystem in production clouds.
        </p>
      </div>

      {/* Production Infrastructure Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Architecture Flow Diagram */}
        <div className="lg:col-span-7 glass-panel p-8 space-y-6">
          <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Cloud Network Topology</span>
          </h3>
          <pre className="text-xs text-emerald-400 font-code whitespace-pre overflow-x-auto leading-relaxed rounded-xl bg-slate-950 p-5 border border-zinc-800 shadow-inner">
            {FAST_API_BLUEPRINT.diagram}
          </pre>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed font-sans">
            <p className="font-bold text-white uppercase font-heading">Data Persistence Security (PostgreSQL Schema):</p>
            <p className="text-zinc-400">
              The analysis history table caches structural outputs under a dynamic <code className="text-indigo-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-code">JSONB</code> column in Postgres. This allows blazing fast querying of JSON keys and structures without requiring schema alterations.
            </p>
          </div>
        </div>

        {/* Directory Tree & Schema Info */}
        <div className="lg:col-span-5 glass-panel p-8 space-y-6">
          <h3 className="text-base font-bold font-heading text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <span>Enterprise Repository Layout</span>
          </h3>
          <div className="code-container-dark p-5 font-code text-xs space-y-1 overflow-x-auto shadow-inner">
            <p className="text-white font-bold uppercase mb-2 font-mono">/resume-ats-analyzer-root</p>
            <p>├── docker-compose.yml <span className="text-slate-400 font-normal"># Postgres/Backend</span></p>
            <p>├── Dockerfile <span className="text-slate-400 font-normal"># Multi-stage image</span></p>
            <p>├── main.py <span className="text-slate-400 font-normal"># FastAPI endpoints</span></p>
            <p>├── database.py <span className="text-slate-400 font-normal"># Async connection pool</span></p>
            <p>├── models.py <span className="text-slate-400 font-normal"># SQLAlchemy 2.0 tables</span></p>
            <p>├── schemas.py <span className="text-slate-400 font-normal"># Pydantic validation</span></p>
            <p>├── services.py <span className="text-slate-400 font-normal"># Gemini API integration</span></p>
            <p>└── alembic/ <span className="text-slate-400 font-normal"># Database migrations</span></p>
          </div>
          <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/60 text-xs">
            <div className="flex gap-2 items-center text-amber-400 font-bold font-mono uppercase mb-1.5">
              <Database className="w-4 h-4" />
              <span>Postgres Configuration</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Configured with SQLAlchemy connection limits (<code className="text-zinc-300 font-code">pool_size=20</code>) and a recycle timer of 1800 seconds to prevent DB connection fatigue under traffic peaks.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Code File Explorer */}
      <div className="glass-panel overflow-hidden">
        <div className="bg-zinc-900/80 border-b border-zinc-800 p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Module Source Explorer</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {FAST_API_BLUEPRINT.files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFileIdx(idx)}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase border transition-all cursor-pointer ${
                  activeFileIdx === idx
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {file.filename}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 bg-slate-950">
          <div className="md:col-span-3 border-r border-zinc-800 p-6 space-y-4 font-sans text-xs">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold block">Active Module</span>
            <h4 className="text-sm font-bold text-white font-mono uppercase">{activeFile.filename}</h4>
            <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800 font-mono text-[10px] text-zinc-400">
              Syntax: {activeFile.language.toUpperCase()}
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Handles microservice workflows securely with standard production patterns.
            </p>

            <button
              onClick={() => copyToClipboard(activeFile.code, activeFileIdx)}
              className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 text-xs uppercase tracking-wider font-semibold cursor-pointer"
            >
              {copiedCodeIdx === activeFileIdx ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="md:col-span-9 p-4 bg-slate-950 overflow-x-auto max-h-[580px] overflow-y-auto">
            <pre className="text-xs text-zinc-200 font-code leading-relaxed p-4 select-all">
              {activeFile.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
