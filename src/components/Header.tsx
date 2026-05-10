/**
 * Encabezado de la app.
 * Agrupa logo y bloque hero para mantener composición semántica.
 */

import { memo } from 'react';
import { HeroSection } from './HeroSection';
import { LogoSection } from './LogoSection';

export const Header = memo(function Header() {
  return (
    <>
      <LogoSection />
      <HeroSection />
    </>
  );
});
