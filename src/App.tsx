import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { StefansLawLab } from './labs/sem1/stefans-law';
import { FourProbeLab } from './labs/sem1/four-probe';
import { HallEffectLab } from './labs/sem1/hall-effect';
import { DiffractionGratingLab } from './labs/sem1/diffraction-grating';
import { CareyFosterLab } from './labs/sem1/carey-foster';
import { NewtonsRingsLab } from './labs/sem1/newtons-rings';
import { PolarimeterLab } from './labs/sem1/polarimeter';
import { getLabBySlug } from './data/labsRegistry';

// ─── Lab route: dispatches to the correct experiment component ─────────────────
function LabRoute() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <ComingSoonPage slug="" />;

  const lab = getLabBySlug(slug);
  if (!lab) return <ComingSoonPage slug={slug} />;

  // Route to the correct experiment
  if (slug === 'stefans-law') return <StefansLawLab />;
  if (slug === 'four-probe') return <FourProbeLab />;
  if (slug === 'hall-effect') return <HallEffectLab />;
  if (slug === 'diffraction-grating') return <DiffractionGratingLab />;
  if (slug === 'carey-foster' || slug === 'carey-foster-bridge') return <CareyFosterLab />;
  if (slug === 'newtons-rings') return <NewtonsRingsLab />;
  if (slug === 'polarimeter' || slug === 'half-shade-polarimeter') return <PolarimeterLab />;

  // All other experiments are coming-soon
  return <ComingSoonPage slug={slug} />;
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/lab/:slug" element={<LabRoute />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  );
}
