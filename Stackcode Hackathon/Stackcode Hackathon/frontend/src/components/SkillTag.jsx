// src/components/SkillTag.jsx

/**
 * @param {object} props
 * @param {string} props.label
 * @param {'match'|'missing'} [props.variant]
 */
export default function SkillTag({ label, variant = 'match' }) {
  const styles = {
    match: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    missing: 'bg-slate-700/60 text-slate-400 ring-1 ring-slate-600/40 line-through decoration-red-400/60',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[variant]}`}>
      {variant === 'match' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 flex-shrink-0" />
      )}
      {variant === 'missing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mr-1.5 flex-shrink-0" />
      )}
      {label}
    </span>
  );
}
