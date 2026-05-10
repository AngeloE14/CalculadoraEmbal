/**
 * Ensambla el cuerpo principal de la calculadora.
 * Este componente existe para mantener separación clara por secciones.
 */

import { memo } from 'react';
import '../styles/components/Calculator.css';
import { Footer } from './Footer';
import { FormSection } from './FormSection';
import { Header } from './Header';
import { ResultsSection } from './ResultsSection';

export const Calculator = memo(function Calculator() {
  return (
    <>
      <Header />
      <section className="layout">
        <FormSection />
        <ResultsSection />
      </section>
      <Footer />
    </>
  );
});
