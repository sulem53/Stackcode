// src/store/useAppStore.js
import { create } from 'zustand';

/**
 * Central Zustand store for the AI Resume-to-Job Matcher.
 *
 * Shape:
 *   profile      — parsed resume profile (null until uploaded)
 *   jobMatches   — array of job match objects, sorted by score desc
 *   applications — array of tracker items { jobId, title, company, stage }
 *   coverLetters — map of jobId → generated cover letter text
 */
const useAppStore = create((set, get) => ({
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  profile: null,
  jobMatches: [],
  applications: [],
  coverLetters: {},

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /** Save the parsed profile (from upload page) */
  setProfile: (profile) => set({ profile }),

  /** Save the ranked job match list (from results page) */
  setJobMatches: (jobMatches) => set({ jobMatches }),

  /**
   * Add a job to the applications tracker.
   * If the job is already in the tracker, this is a no-op.
   * @param {{ jobId, title, company }} job
   */
  applyToJob: (job) => {
    const { applications } = get();
    const alreadyApplied = applications.some((a) => a.jobId === job.jobId);
    if (alreadyApplied) return;
    set({
      applications: [
        ...applications,
        { jobId: job.jobId, title: job.title, company: job.company, stage: 'Applied' },
      ],
    });
  },

  /**
   * Update the stage of an existing application.
   * @param {string} jobId
   * @param {string} stage — one of: Interested | Applied | Interview | Selected | Rejected
   */
  updateApplicationStage: (jobId, stage) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.jobId === jobId ? { ...app, stage } : app
      ),
    }));
  },

  /**
   * Store a generated cover letter keyed by jobId.
   * @param {string} jobId
   * @param {string} text
   */
  setCoverLetter: (jobId, text) => {
    set((state) => ({
      coverLetters: { ...state.coverLetters, [jobId]: text },
    }));
  },
}));

export default useAppStore;
