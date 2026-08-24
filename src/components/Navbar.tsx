/**
 * Human-Crafted SaaS Navigation Bar Component
 * @license Apache-2.0
 */

import React from 'react';
import { Sparkles, Terminal, Layers, Briefcase, BarChart3, Sun, Moon, Cpu, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'scanner' | 'versioning' | 'tracker' | 'evaluation' | 'blueprints';

interface NavbarProps {
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  apiKeyProvisioned: boolean;
}

export default function Navbar({ currentTab, setCurrentTab, apiKeyProvisioned }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass-header border-b transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('scanner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight font-heading text-gradient">
                  TalentIQ <span className="font-normal text-zinc-400 text-sm">ATS</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                AI Recruitment Intelligence & ATS Optimizer
              </p>
            </div>
          </div>

          {/* SaaS Navigation Pills */}
          <nav className="hidden lg:flex items-center space-x-1 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setCurrentTab('scanner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'scanner'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Resume Auditor</span>
            </button>

            <button
              onClick={() => setCurrentTab('versioning')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'versioning'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Versions</span>
            </button>

            <button
              onClick={() => setCurrentTab('tracker')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'tracker'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Applications</span>
            </button>

            <button
              onClick={() => setCurrentTab('evaluation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'evaluation'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>AI Benchmark</span>
            </button>

            <button
              onClick={() => setCurrentTab('blueprints')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'blueprints'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Status & Theme Toggle Controls */}
          <div className="flex items-center space-x-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold hidden sm:inline text-zinc-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold hidden sm:inline text-zinc-700">Dark Mode</span>
                </>
              )}
            </button>

            {/* Engine Indicator */}
            <div className={`hidden sm:flex items-center space-x-2 text-xs px-3.5 py-2 rounded-xl border font-semibold ${
              apiKeyProvisioned 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{apiKeyProvisioned ? 'Gemini 3.5 Active' : 'Deterministic Hybrid Engine'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
