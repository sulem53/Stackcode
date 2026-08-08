// src/pages/TrackerPage.jsx
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const STAGES = ['Interested', 'Applied', 'Interview', 'Selected', 'Rejected'];

const STAGE_STYLES = {
  Interested: 'bg-slate-700/60 text-slate-300 ring-slate-600/40',
  Applied: 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
  Interview: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  Selected: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  Rejected: 'bg-red-500/20 text-red-300 ring-red-500/30',
};

export default function TrackerPage() {
  const navigate = useNavigate();
  const applications = useAppStore((s) => s.applications);
  const updateApplicationStage = useAppStore((s) => s.updateApplicationStage);

  const empty = applications.length === 0;

  // Group by stage for summary counts
  const stageCounts = STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.stage === stage).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Application Tracker</h1>
          <p className="text-slate-400 mt-1.5">
            {empty
              ? 'No applications yet.'
              : `Tracking ${applications.length} application${applications.length !== 1 ? 's' : ''}`}
          </p>

          {/* Stage pills summary */}
          {!empty && (
            <div className="mt-5 flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <div
                  key={stage}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${STAGE_STYLES[stage]}`}
                >
                  {stage}
                  {stageCounts[stage] > 0 && (
                    <span className="font-bold">{stageCounts[stage]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {empty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 ring-1 ring-white/8 flex items-center justify-center text-4xl mb-5">
              📋
            </div>
            <h2 className="text-xl font-semibold text-white">No applications yet</h2>
            <p className="text-slate-400 mt-2 max-w-sm">
              Apply to jobs from the Results page to see them here. You can then update the stage as you progress.
            </p>
            <button
              id="go-to-results-btn"
              onClick={() => navigate('/results')}
              className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
            >
              Browse Job Matches →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.jobId}
                className="group flex items-center gap-4 bg-slate-800/50 border border-white/8 rounded-2xl px-5 py-4 hover:border-white/15 transition-all duration-200"
              >
                {/* Stage dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    app.stage === 'Selected'
                      ? 'bg-emerald-400'
                      : app.stage === 'Rejected'
                      ? 'bg-red-400'
                      : app.stage === 'Interview'
                      ? 'bg-amber-400'
                      : app.stage === 'Applied'
                      ? 'bg-indigo-400'
                      : 'bg-slate-500'
                  }`}
                />

                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{app.title}</p>
                  <p className="text-sm text-slate-400 truncate">{app.company}</p>
                </div>

                {/* Stage dropdown */}
                <select
                  id={`stage-select-${app.jobId}`}
                  value={app.stage}
                  onChange={(e) => updateApplicationStage(app.jobId, e.target.value)}
                  className={`flex-shrink-0 appearance-none cursor-pointer text-sm font-medium px-3 py-1.5 rounded-lg ring-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 bg-transparent ${STAGE_STYLES[app.stage]}`}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="bg-slate-800 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
