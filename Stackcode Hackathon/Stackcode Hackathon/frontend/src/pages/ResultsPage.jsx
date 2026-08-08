// src/pages/ResultsPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResultsPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const jobMatches = useAppStore((s) => s.jobMatches);
  const applications = useAppStore((s) => s.applications);

  // If no profile, redirect to upload
  useEffect(() => {
    if (!profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  if (!profile) return null;

  if (jobMatches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Fetching job matches…" size="lg" />
      </div>
    );
  }

  const appliedCount = applications.length;

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your job matches</h1>
          <p className="text-slate-400 mt-1.5">
            Found <span className="text-indigo-400 font-semibold">{jobMatches.length} roles</span> ranked by AI compatibility score for <span className="text-white font-medium">{profile.name}</span>
          </p>

          {/* Stats strip */}
          <div className="mt-5 flex gap-4 flex-wrap">
            {[
              { label: 'Top score', value: `${jobMatches[0]?.score ?? '—'}/100`, color: 'text-emerald-400' },
              { label: 'Applied', value: appliedCount, color: 'text-indigo-400' },
              { label: 'Avg score', value: `${Math.round(jobMatches.reduce((s, j) => s + j.score, 0) / jobMatches.length)}/100`, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-800/50 border border-white/8 rounded-xl px-5 py-3 flex flex-col">
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-slate-500 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job cards */}
        <div className="space-y-4">
          {jobMatches.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>

        {/* Footer CTA */}
        {appliedCount > 0 && (
          <div className="mt-8 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">
                You've applied to {appliedCount} {appliedCount === 1 ? 'job' : 'jobs'}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">Track your applications and update their status.</p>
            </div>
            <button
              id="go-to-tracker-btn"
              onClick={() => navigate('/tracker')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              View Tracker →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
