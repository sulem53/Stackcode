// src/components/LoadingSpinner.jsx

/**
 * @param {object} props
 * @param {string} [props.label] — text shown below the spinner
 * @param {'sm'|'md'|'lg'} [props.size]
 */
export default function LoadingSpinner({ label, size = 'md' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-indigo-500/20 border-t-indigo-500 animate-spin`}
      />
      {label && (
        <p className="text-sm text-slate-400 animate-pulse">{label}</p>
      )}
    </div>
  );
}
