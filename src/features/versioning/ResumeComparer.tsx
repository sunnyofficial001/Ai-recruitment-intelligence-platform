/**
 * Human-Crafted Resume Version Comparison Feature Component
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { AnalysisResult } from '../../types/domain';
import { Layers, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface ResumeComparerProps {
  history: AnalysisResult[];
}

export default function ResumeComparer({ history }: ResumeComparerProps) {
  const [selectedV1Id, setSelectedV1Id] = useState<string>(history[1]?.id || history[0]?.id || '');
  const [selectedV2Id, setSelectedV2Id] = useState<string>(history[0]?.id || '');

  const v1 = history.find(h => h.id === selectedV1Id);
  const v2 = history.find(h => h.id === selectedV2Id);

  if (history.length < 2) {
    return (
      <div className="glass-panel p-16 text-center space-y-4 font-sans text-slate-100 max-w-2xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold font-heading uppercase tracking-wide">Version Progression Requires 2+ Analyses</h3>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          Execute an additional ATS analysis or apply recommended keyword optimizations to compare score evolution side-by-side.
        </p>
      </div>
    );
  }

  const scoreDelta = (v2?.atsScore || 0) - (v1?.atsScore || 0);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Selector Card Header */}
      <div className="glass-panel p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iterative Resume Evolution</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Resume Version Progression Comparison
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800 text-xs">
          <div>
            <label className="text-zinc-400 uppercase font-mono font-bold block mb-2">Select Baseline Version (V1):</label>
            <select
              value={selectedV1Id}
              onChange={e => setSelectedV1Id(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none font-mono"
            >
              {history.map(h => (
                <option key={h.id} value={h.id}>
                  {h.resumeName} - {h.atsScore}% ({new Date(h.timestamp).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 uppercase font-mono font-bold block mb-2">Select Optimized Version (V2):</label>
            <select
              value={selectedV2Id}
              onChange={e => setSelectedV2Id(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none font-mono"
            >
              {history.map(h => (
                <option key={h.id} value={h.id}>
                  {h.resumeName} - {h.atsScore}% ({new Date(h.timestamp).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progression Delta Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-zinc-900/40 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase font-semibold block">MATCH FIT PROGRESSION</span>
            <h3 className="text-xl font-bold font-heading text-white">
              ATS Score Progression: {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6 text-3xl font-extrabold font-heading">
          <span className="text-zinc-400">{v1?.atsScore}%</span>
          <ArrowRight className="w-6 h-6 text-indigo-400" />
          <span className="text-emerald-400">{v2?.atsScore}%</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        {/* V1 Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <span className="font-bold font-heading uppercase text-zinc-400">Baseline Version (V1)</span>
            <span className="text-2xl font-black font-heading text-white">{v1?.atsScore}%</span>
          </div>
          <p className="text-zinc-300 font-mono">Target Role: {v1?.jobTitle}</p>
          <div className="space-y-2">
            <p className="font-bold text-zinc-300">Missing Keyword Gaps ({v1?.gaps?.length || 0}):</p>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {v1?.gaps?.map((g, i) => (
                <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                  {g.keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* V2 Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <span className="font-bold font-heading uppercase text-emerald-400">Optimized Version (V2)</span>
            <span className="text-2xl font-black font-heading text-emerald-400">{v2?.atsScore}%</span>
          </div>
          <p className="text-zinc-300 font-mono">Target Role: {v2?.jobTitle}</p>
          <div className="space-y-2">
            <p className="font-bold text-zinc-300">Remaining Keyword Gaps ({v2?.gaps?.length || 0}):</p>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {v2?.gaps?.map((g, i) => (
                <span key={i} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                  {g.keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
