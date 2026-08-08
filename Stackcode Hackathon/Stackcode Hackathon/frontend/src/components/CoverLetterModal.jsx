// src/components/CoverLetterModal.jsx
import { useEffect, useState } from 'react';
import { generateCoverLetter } from '../api/resumeApi';
import useAppStore from '../store/useAppStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * @param {object} props
 * @param {{ jobId, title, company }} props.job
 * @param {Function} props.onClose
 */
export default function CoverLetterModal({ job, onClose }) {
  const profile = useAppStore((s) => s.profile);
  const coverLetters = useAppStore((s) => s.coverLetters);
  const setCoverLetter = useAppStore((s) => s.setCoverLetter);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const letter = coverLetters[job.jobId];

  useEffect(() => {
    // If we already have a cached letter, show it instantly
    if (letter) return;

    setLoading(true);
    generateCoverLetter(job.jobId, profile)
      .then((text) => {
        setCoverLetter(job.jobId, text);
      })
      .finally(() => setLoading(false));
  }, [job.jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = () => {
    if (!letter) return;
    navigator.clipboard.writeText(letter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      id="cover-letter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Cover Letter</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {job.title} · {job.company}
            </p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner label="Generating cover letter with AI…" size="lg" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
              {letter}
            </pre>
          )}
        </div>

        {/* Footer */}
        {!loading && letter && (
          <div className="p-6 border-t border-white/10 flex justify-end gap-3">
            <button
              id="close-letter-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Close
            </button>
            <button
              id="copy-letter-btn"
              onClick={handleCopy}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
