import React, { useState, createContext, useContext } from 'react';
import { TabBar, type Tab } from '../ui/TabBar';
import { BookOpen, FlaskConical, Table2, HelpCircle } from 'lucide-react';

export type LabTab = 'theory' | 'bench' | 'table' | 'viva';

export interface LabShellContextType {
  activeTab: LabTab;
  isPiP: boolean;
  setIsPiP: (pip: boolean) => void;
}

const LabShellContext = createContext<LabShellContextType>({
  activeTab: 'theory',
  isPiP: false,
  setIsPiP: () => {},
});

export function useLabShell(): LabShellContextType {
  return useContext(LabShellContext);
}

interface LabShellProps {
  title: string;
  category?: string;
  theory: React.ReactNode;
  bench: React.ReactNode;
  table: React.ReactNode;
  viva: React.ReactNode;
  activeTab?: LabTab;
  onTabChange?: (tab: LabTab) => void;
  headerBadge?: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'theory', label: 'Theory & Aim',       icon: <BookOpen size={15} /> },
  { id: 'bench',  label: 'Virtual Bench',       icon: <FlaskConical size={15} /> },
  { id: 'table',  label: 'Observations & Math', icon: <Table2 size={15} /> },
  { id: 'viva',   label: 'Viva & Quiz',          icon: <HelpCircle size={15} /> },
];

export function LabShell({
  title,
  category = 'Year 1 · Semester 1 · Thermal Physics',
  theory,
  bench,
  table,
  viva,
  activeTab: controlledTab,
  onTabChange,
  headerBadge,
}: LabShellProps) {
  const [internalTab, setInternalTab] = useState<LabTab>('bench');
  const [isPiP, setIsPiP] = useState<boolean>(false);

  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (id: string) => {
    const tabId = id as LabTab;
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }
  };

  return (
    <LabShellContext.Provider value={{ activeTab, isPiP, setIsPiP }}>
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
        {/* Lab title bar */}
        <div className="px-4 md:px-6 py-3.5 border-b border-[var(--border)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-[var(--text)] tracking-tight">{title}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{category}</p>
          </div>
          {headerBadge && <div>{headerBadge}</div>}
        </div>

        {/* Tab bar */}
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* Tab content area — Persistent DOM mounting preserves video & bench states */}
        <div className="flex-1 bg-[var(--bg)] relative">
          {/* Tab 1: Theory & Persistent Video Player */}
          <div
            className={
              activeTab === 'theory'
                ? 'block'
                : isPiP && activeTab !== 'viva'
                ? 'block'
                : 'hidden'
            }
          >
            {theory}
          </div>

          {/* Tab 2: Virtual Bench */}
          <div className={activeTab === 'bench' ? 'block' : 'hidden'}>
            {bench}
          </div>

          {/* Tab 3: Observations & Math */}
          <div className={activeTab === 'table' ? 'block' : 'hidden'}>
            {table}
          </div>

          {/* Tab 4: Viva & Quiz */}
          <div className={activeTab === 'viva' ? 'block' : 'hidden'}>
            {viva}
          </div>
        </div>
      </div>
    </LabShellContext.Provider>
  );
}
