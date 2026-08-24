/**
 * Human-Crafted Job Application Tracker Feature Component
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '../../types/domain';
import { Plus, Briefcase, Trash2, Calendar, ExternalLink, Filter, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [atsScore, setAtsScore] = useState<number>(85);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    try {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          jobUrl,
          appliedDate: new Date().toISOString().split('T')[0],
          status,
          atsScore,
          notes
        })
      });

      if (res.ok) {
        const newItem = await res.json();
        setApplications(prev => [newItem, ...prev]);
        setShowAddModal(false);
        setCompany('');
        setRole('');
        setJobUrl('');
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApps = filterStatus === 'ALL' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  const totalCount = applications.length;
  const interviewCount = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
  const offerCount = applications.filter(a => a.status === 'Offer').length;
  const avgScore = totalCount > 0 
    ? Math.round(applications.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / totalCount)
    : 0;

  const interviewRate = totalCount > 0 ? Math.round((interviewCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 font-sans">
      {/* Header & Action Bar */}
      <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold block mb-1">
            Recruitment Pipeline Tracker
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Application Tracking & Conversion Loop
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor active applications, target ATS match scores, and interview conversion ratios.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Application</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="glass-panel p-6 space-y-1">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Total Applications</span>
          <p className="text-3xl font-extrabold font-heading text-white">{totalCount}</p>
        </div>
        <div className="glass-panel p-6 space-y-1">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Avg ATS Match Fit</span>
          <p className="text-3xl font-extrabold font-heading text-emerald-400">{avgScore}%</p>
        </div>
        <div className="glass-panel p-6 space-y-1">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Interview Conversion</span>
          <p className="text-3xl font-extrabold font-heading text-amber-400">{interviewRate}%</p>
        </div>
        <div className="glass-panel p-6 space-y-1">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Offers Extended</span>
          <p className="text-3xl font-extrabold font-heading text-white">{offerCount}</p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-400 font-bold uppercase">Status Filter:</span>
          {['ALL', 'Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg border transition-all uppercase text-[11px] font-bold cursor-pointer ${
                filterStatus === st 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-zinc-400 font-bold">{filteredApps.length} Applications Listed</span>
      </div>

      {/* Application Cards List */}
      {filteredApps.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-3 font-sans max-w-2xl mx-auto my-6">
          <Briefcase className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold font-heading uppercase text-white">No Application Records Found</h3>
          <p className="text-xs text-zinc-400">Log job applications to track interview conversion rates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold font-heading text-white">{app.role}</h3>
                  <span className="text-xs font-mono text-indigo-400">@ {app.company}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    Applied: {app.appliedDate}
                  </span>
                  {app.jobUrl && (
                    <a 
                      href={app.jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Job Spec
                    </a>
                  )}
                  {app.notes && <span>Notes: {app.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg font-bold">
                  {app.atsScore || 80}% MATCH
                </span>
                <span className={`px-3 py-1 rounded-lg border font-bold text-[11px] uppercase ${
                  app.status === 'Offer' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  app.status === 'Interview' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  app.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}>
                  {app.status}
                </span>

                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                  title="Delete Application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full space-y-6 font-sans">
            <h3 className="text-lg font-bold font-heading text-white border-b border-zinc-800 pb-3 uppercase">
              Log Job Application
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Acme SaaS Corp"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase block mb-1">Target Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase block mb-1">ATS Match Fit %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={atsScore}
                    onChange={e => setAtsScore(Number(e.target.value))}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase block mb-1">Job Spec URL</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={e => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase block mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Recruiter contact, interview timeline..."
                  rows={3}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white uppercase font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 uppercase font-semibold cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
