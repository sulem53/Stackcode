// src/pages/UploadPage.jsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, fetchJobMatches } from '../api/resumeApi';
import useAppStore from '../store/useAppStore';
import LoadingSpinner from '../components/LoadingSpinner';

const STAGES = ['idle', 'analyzing', 'editing'];

const EMPTY_EXP = () => ({ role: '', company: '', years: 1 });
const EMPTY_EDU = () => ({ degree: '', institution: '', year: '' });

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const setProfile = useAppStore((s) => s.setProfile);
  const setJobMatches = useAppStore((s) => s.setJobMatches);

  const [stage, setStage] = useState('idle');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Editable profile form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    skills: [],
    experience: [],
    education: [],
    totalYearsExperience: 0,
  });
  const [skillInput, setSkillInput] = useState('');

  // ─── File handling ──────────────────────────────────────────────────────────

  const acceptFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e) => acceptFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStage('analyzing');

    const parsed = await uploadResume(selectedFile);

    // Pre-fill form with parsed data
    setForm(parsed);
    setStage('editing');
  };

  // ─── Form helpers ────────────────────────────────────────────────────────────

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,$/, '');
      if (!form.skills.includes(newSkill)) {
        setForm((f) => ({ ...f, skills: [...f.skills, newSkill] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (idx) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }));
  };

  const updateExp = (idx, field, value) => {
    setForm((f) => {
      const exp = [...f.experience];
      exp[idx] = { ...exp[idx], [field]: field === 'years' ? Number(value) : value };
      return { ...f, experience: exp };
    });
  };

  const addExp = () => setForm((f) => ({ ...f, experience: [...f.experience, EMPTY_EXP()] }));
  const removeExp = (idx) =>
    setForm((f) => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) }));

  const updateEdu = (idx, field, value) => {
    setForm((f) => {
      const edu = [...f.education];
      edu[idx] = { ...edu[idx], [field]: value };
      return { ...f, education: edu };
    });
  };

  const addEdu = () => setForm((f) => ({ ...f, education: [...f.education, EMPTY_EDU()] }));
  const removeEdu = (idx) =>
    setForm((f) => ({ ...f, education: f.education.filter((_, i) => i !== idx) }));

  // ─── Confirm & navigate ──────────────────────────────────────────────────────

  const handleConfirm = async () => {
    const totalYears = form.experience.reduce((acc, e) => acc + (Number(e.years) || 0), 0);
    const profile = { ...form, totalYearsExperience: totalYears };

    setProfile(profile);
    setConfirmLoading(true);

    const matches = await fetchJobMatches(profile);
    setJobMatches(matches);

    setConfirmLoading(false);
    navigate('/results');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (stage === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold text-white">Analyzing your resume…</h2>
          <p className="text-slate-400 text-sm">Extracting skills, experience, and education</p>
        </div>
      </div>
    );
  }

  if (stage === 'editing') {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Resume parsed successfully
            </div>
            <h1 className="text-3xl font-bold text-white">Review your profile</h1>
            <p className="text-slate-400 mt-1">Edit the details below before finding your matches.</p>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <section className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Basic Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Skills</h2>
              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 ring-1 ring-indigo-500/40 text-indigo-300 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="text-indigo-400 hover:text-white transition-colors text-xs leading-none"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                id="skill-input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter or comma…"
                className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
              />
            </section>

            {/* Experience */}
            <section className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Experience</h2>
                <button
                  type="button"
                  id="add-exp-btn"
                  onClick={addExp}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  + Add row
                </button>
              </div>
              {form.experience.map((exp, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_72px_28px] gap-3 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Role</label>
                    <input
                      id={`exp-role-${i}`}
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExp(i, 'role', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Company</label>
                    <input
                      id={`exp-company-${i}`}
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExp(i, 'company', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Years</label>
                    <input
                      id={`exp-years-${i}`}
                      type="number"
                      min="0"
                      max="40"
                      value={exp.years}
                      onChange={(e) => updateExp(i, 'years', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExp(i)}
                    className="h-10 w-7 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors text-lg"
                    aria-label="Remove experience row"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.experience.length === 0 && (
                <p className="text-sm text-slate-500 italic">No experience added yet.</p>
              )}
            </section>

            {/* Education */}
            <section className="bg-slate-800/50 border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Education</h2>
                <button
                  type="button"
                  id="add-edu-btn"
                  onClick={addEdu}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  + Add row
                </button>
              </div>
              {form.education.map((edu, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_28px] gap-3 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Degree</label>
                    <input
                      id={`edu-degree-${i}`}
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEdu(i, 'degree', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Institution</label>
                    <input
                      id={`edu-institution-${i}`}
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEdu(i, 'institution', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Year</label>
                    <input
                      id={`edu-year-${i}`}
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEdu(i, 'year', e.target.value)}
                      className="w-full bg-slate-700/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEdu(i)}
                    className="h-10 w-7 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors text-lg"
                    aria-label="Remove education row"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.education.length === 0 && (
                <p className="text-sm text-slate-500 italic">No education added yet.</p>
              )}
            </section>

            {/* Confirm button */}
            <button
              id="confirm-find-jobs-btn"
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {confirmLoading ? 'Finding your matches…' : 'Confirm & Find Jobs →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Idle / Upload stage ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Hero text */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Groq AI
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
            Match your resume<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              to the perfect job
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Upload your resume and let AI find the best job matches, score them, and help you craft a winning cover letter.
          </p>
        </div>

        {/* Drop zone */}
        <div
          id="drop-zone"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 flex flex-col items-center gap-4 transition-all duration-200 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/5'
              : selectedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/15 hover:border-indigo-500/50 hover:bg-indigo-500/5'
          }`}
        >
          <input
            ref={fileRef}
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/40 flex items-center justify-center text-3xl">
                📄
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{selectedFile.name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.name.split('.').pop().toUpperCase()}
                </p>
                <p className="text-xs text-slate-500 mt-2">Click to change file</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-3xl">
                📎
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Drop your resume here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                <p className="text-xs text-slate-500 mt-2">PDF or DOCX · Max 10 MB</p>
              </div>
            </>
          )}
        </div>

        {/* Upload button */}
        <button
          id="upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile}
          className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200 active:scale-[0.99]"
        >
          {selectedFile ? 'Analyze Resume →' : 'Select a file to continue'}
        </button>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { emoji: '🎯', label: 'AI Matching' },
            { emoji: '📊', label: 'Scored Results' },
            { emoji: '✉️', label: 'Cover Letters' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
