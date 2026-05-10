/**
 * Página principal.
 * Mantiene la estructura visual de página única del proyecto original.
 */

import { lazy, Suspense } from 'react';
import { Calculator } from '../components/Calculator';
import { ThemeToggle } from '../components/ThemeToggle';

const LazyAudioPlayer = lazy(async () => {
  const module = await import('../components/AudioPlayer');
  return { default: module.AudioPlayer };
});

export function HomePage() {
  return (
    <>
      <div className="fondo-ambiental" aria-hidden="true"></div>
      <ThemeToggle />
      <main className="panel">
        <Calculator />
      </main>
      {/* El audio no es crítico para el primer render; se carga en diferido. */}
      <Suspense fallback={null}>
        <LazyAudioPlayer />
      </Suspense>
    </>
  );
}
