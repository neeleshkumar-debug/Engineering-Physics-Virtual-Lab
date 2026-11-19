// ─── Navbar ────────────────────────────────────────────────────────────────────
import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, Sun, Moon, ChevronRight, Github } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function Navbar() {
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();

  // Build breadcrumb from path
  const isLabPage = location.pathname.startsWith('/lab/');
  const slug = isLabPage ? location.pathname.replace('/lab/', '') : null;

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md px-4 md:px-6 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center group-hover:scale-105 transition-transform">
          <FlaskConical size={18} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-[var(--text)] leading-tight">Physics Virtual Lab</p>
          <p className="text-[10px] text-[var(--text-muted)] leading-tight">B.Tech Engineering</p>
        </div>
      </Link>

      {/* Breadcrumb */}
      {isLabPage && slug && (
        <div className="flex items-center gap-1 text-sm text-[var(--text-muted)] min-w-0">
          <ChevronRight size={14} className="shrink-0" />
          <span className="truncate capitalize">{slug.replace(/-/g, ' ')}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* GitHub link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          title="View on GitHub"
        >
          <Github size={18} />
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
