import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  PictureInPicture2,
  Minimize2,
  X,
  GripHorizontal,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useLabShell } from '../layout/LabShell';

export interface AcademicReferenceItem {
  label: string;
  url: string;
}

export interface LabVideoPlayerProps {
  videoId: string;
  title: string;
  headerTitle?: string;
  fallbackWatchUrl?: string;
  secondaryWatchUrl?: { title: string; url: string };
  academicReferences?: AcademicReferenceItem[];
}

export function LabVideoPlayer({
  videoId,
  title,
  headerTitle = 'Video Demonstration & Reference Manuals',
  fallbackWatchUrl,
  secondaryWatchUrl,
  academicReferences = [],
}: LabVideoPlayerProps) {
  const { activeTab, isPiP, setIsPiP } = useLabShell();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Playback state tracking
  const isPlayingRef = useRef<boolean>(false);
  const pausedByTabSwitchRef = useRef<boolean>(false);

  // Floating PiP Drag Position (null = default bottom-5 right-5)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // YouTube embed URL with enablejsapi=1
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`;

  // Send command to YouTube iframe via postMessage
  const sendIframeCommand = useCallback((command: 'pauseVideo' | 'playVideo') => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: '',
        }),
        '*'
      );
    } catch {
      // ignore
    }
  }, []);

  // Listen for YouTube iframe state changes to track playback
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // YouTube postMessage format: { event: 'onStateChange', info: 1 }
        // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
        if (data.event === 'onStateChange' || (data.info !== undefined && typeof data.info === 'number')) {
          const state = data.info;
          if (state === 1) {
            isPlayingRef.current = true;
          } else if (state === 2 || state === 0) {
            isPlayingRef.current = false;
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initialize YouTube API listening once iframe loads
  const handleIframeLoad = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      );
    } catch {
      // ignore
    }
  };

  // Auto-Pause & Auto-Resume logic on Tab Switch
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;

    if (prevTab === activeTab) return;

    // 1. Switching to 'viva' tab: ALWAYS pause & hide (zero distractions during quiz)
    if (activeTab === 'viva') {
      if (isPlayingRef.current) {
        sendIframeCommand('pauseVideo');
        pausedByTabSwitchRef.current = true;
      }
      return;
    }

    // 2. Switching away from 'theory' when PiP mode is OFF: pause video
    if (prevTab === 'theory' && activeTab !== 'theory' && !isPiP) {
      if (isPlayingRef.current) {
        sendIframeCommand('pauseVideo');
        pausedByTabSwitchRef.current = true;
      }
      return;
    }

    // 3. Returning to 'theory' (or returning from 'viva' back to bench/table with PiP on): resume
    if (activeTab === 'theory' || (isPiP && prevTab === 'viva')) {
      if (pausedByTabSwitchRef.current) {
        sendIframeCommand('playVideo');
        pausedByTabSwitchRef.current = false;
      }
    }
  }, [activeTab, isPiP, sendIframeCommand]);

  // Dragging handlers for the floating mini-player
  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    const playerEl = document.getElementById('pip-floating-player-box');
    if (playerEl) {
      const rect = playerEl.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 340, moveEvent.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 220, moveEvent.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDockBack = () => {
    setIsPiP(false);
    setPosition(null);
  };

  // Determine visibility states
  const isTheoryTab = activeTab === 'theory';
  // PiP should be visible on 'bench' and 'table' if isPiP is true, but hidden on 'viva'
  const isFloatingVisible = isPiP && activeTab !== 'viva';

  return (
    <>
      {/* ── 1. Static Card Container in Tab 1 (Theory) ───────────────────── */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
        {/* Card Header & PiP Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--text)] font-semibold text-sm">
            <Video size={16} className="text-red-400" />
            <h3>{headerTitle}</h3>
          </div>

          <button
            onClick={() => {
              if (isPiP) {
                handleDockBack();
              } else {
                setIsPiP(true);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              isPiP
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--bg)] hover:bg-[var(--border)] text-[var(--text)] border-[var(--border)]'
            }`}
            title={isPiP ? 'Dock mini-player back into document' : 'Keep video playing while using Virtual Bench or Observations'}
          >
            <PictureInPicture2 size={13} />
            <span>{isPiP ? 'Dock Player' : 'Play in Picture-in-Picture'}</span>
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Physical apparatus setup, connection procedure, and experimental demonstration:
        </p>

        {/* Inline Placeholder when PiP is active */}
        {isPiP && (
          <div className="w-full aspect-video rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg)] flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)] p-6 text-center">
            <div className="flex items-center gap-2 text-[var(--text)] font-medium text-xs">
              <PictureInPicture2 size={16} className="text-[var(--accent)]" />
              <span>Playing in Picture-in-Picture Mini-Player</span>
            </div>
            <p className="text-[11px] max-w-sm">
              The video is floating at the bottom-right so you can refer to it while using the Virtual Bench or Observation Table.
            </p>
            <button
              onClick={handleDockBack}
              className="mt-1 px-3 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--text)] transition-colors inline-flex items-center gap-1.5"
            >
              <Minimize2 size={12} />
              <span>Dock Player Back Here</span>
            </button>
          </div>
        )}

        {/* Secondary Links & Citations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {fallbackWatchUrl && (
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Video size={12} className="text-red-400" />
                Direct Video Link
              </span>
              <div className="text-xs space-y-1">
                <div>
                  <a
                    href={fallbackWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    {title}
                    <ExternalLink size={11} />
                  </a>
                </div>
                {secondaryWatchUrl && (
                  <div>
                    <a
                      href={secondaryWatchUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {secondaryWatchUrl.title}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {academicReferences.length > 0 && (
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={12} className="text-emerald-400" />
                Academic References
              </span>
              <ul className="text-xs space-y-1">
                {academicReferences.map((ref, idx) => (
                  <li key={idx}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {ref.label}
                      <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. The EXACT SAME YouTube IFrame Box (Toggled between Inline and PiP via CSS) ── */}
      <div
        id="pip-floating-player-box"
        style={
          isPiP
            ? position
              ? { left: `${position.x}px`, top: `${position.y}px` }
              : undefined
            : undefined
        }
        className={
          isPiP
            ? `fixed z-50 w-80 sm:w-96 rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1117] shadow-2xl transition-opacity duration-200 flex flex-col ${
                !position ? 'bottom-5 right-5' : ''
              } ${isFloatingVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none -left-[9999px] -top-[9999px]'}`
            : isTheoryTab
            ? '-mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-black/60 shadow-sm'
            : 'fixed -left-[9999px] -top-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
        }
      >
        {/* Floating Mini-Player Draggable Header (Only rendered when in PiP mode) */}
        {isPiP && (
          <div
            onMouseDown={handleMouseDown}
            className="px-3 py-1.5 bg-[#161b22] border-b border-[var(--border)] flex items-center justify-between text-xs select-none cursor-move text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0"
          >
            <div className="flex items-center gap-1.5 truncate pr-2">
              <GripHorizontal size={14} className="text-[var(--text-muted)] shrink-0" />
              <Video size={13} className="text-red-400 shrink-0" />
              <span className="truncate text-[11px] font-medium text-[var(--text)]">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleDockBack}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                title="Dock player back to Theory tab"
              >
                <Minimize2 size={13} />
              </button>
              <button
                onClick={handleDockBack}
                className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Close mini-player"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* The Single Persistent IFrame */}
        <div className="flex-1 w-full h-full relative aspect-video bg-black">
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="w-full h-full block"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </>
  );
}
