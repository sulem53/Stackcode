// src/components/ScoreBadge.jsx

/**
 * Displays a score as a coloured ring badge.
 * Green: > 80, Yellow: 60–80, Red: < 60
 */
export default function ScoreBadge({ score }) {
  const getColor = () => {
    if (score > 80) return { ring: 'ring-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' };
    if (score >= 60) return { ring: 'ring-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' };
    return { ring: 'ring-red-500', text: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-red-500/20' };
  };

  const { ring, text, bg, glow } = getColor();

  return (
    <div
      className={`w-16 h-16 rounded-full ring-2 ${ring} ${bg} flex flex-col items-center justify-center shadow-lg ${glow} flex-shrink-0`}
    >
      <span className={`text-xl font-bold leading-none ${text}`}>{score}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-wider ${text} opacity-80`}>score</span>
    </div>
  );
}
