// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const links = [
  { to: '/', label: 'Upload' },
  { to: '/results', label: 'Results' },
  { to: '/tracker', label: 'Tracker' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const applications = useAppStore((s) => s.applications);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-slate-900/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/30">
            AI
          </span>
          <span className="font-semibold text-white tracking-tight">
            Resume<span className="text-indigo-400">Matcher</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
                {label === 'Tracker' && applications.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
                    {applications.length}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
