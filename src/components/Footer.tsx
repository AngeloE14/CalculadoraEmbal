/**
 * Pie de página.
 * Mantiene encapsulada la sección de redes para que el layout sea simple.
 */

import { memo } from 'react';
import { SocialSection } from './SocialSection';

export const Footer = memo(function Footer() {
  return <SocialSection />;
});
