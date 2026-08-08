// src/components/JobCard.jsx
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import ScoreBadge from './ScoreBadge';
import SkillTag from './SkillTag';
import CoverLetterModal from './CoverLetterModal';

/**
 * @param {{ job: object }} props
 */
export default function JobCard({ job }) {
  const applications = useAppStore((s) => s.applications);
  const applyToJob = useAppStore((s) => s.applyToJob);
  const [showModal, setShowModal] = useState(false);

  const isApplied = applications.some((a) => a.jobId === job.jobId);

  const handleApply = () => {
    applyToJob(job);
  };

  return (
    <>
      <div className="group relative bg-slate-800/50 border border-white/8 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
        {/* Score badge — absolute top-right */}
        <div className="absolute top-5 right-5">
          <ScoreBadge score={job.score} />
        </div>

        {/* Header */}
        <div className="pr-20">
          <h3 className="text-xl font-bold text-white leading-tight">{job.title}</h3>
          <p className="text-indigo-400 font-medium mt-0.5">{job.company}</p>
        </div>

        {/* Rationale */}
        <p className="mt-4 text-sm text-slate-400 leading-relaxed line-clamp-3">
          {job.rationale}
        </p>

        {/* Skills */}
        <div className="mt-4 space-y-2">
          {job.matchingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.matchingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="match" />
              ))}
            </div>
          )}
          {job.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.missingSkills.map((skill) => (
                <SkillTag key={skill} label={skill} variant="missing" />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3 pt-4 border-t border-white/5">
          <button
            id={`apply-btn-${job.jobId}`}
            onClick={handleApply}
            disabled={isApplied}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isApplied
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]'
            }`}
          >
            {isApplied ? '✓ Applied' : 'Apply'}
          </button>
          <button
            id={`cover-letter-btn-${job.jobId}`}
            onClick={() => setShowModal(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-200"
          >
            Cover Letter
          </button>
        </div>
      </div>

      {showModal && (
        <CoverLetterModal job={job} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
