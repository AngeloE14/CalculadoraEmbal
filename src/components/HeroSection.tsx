import { memo } from 'react';
import '../styles/components/HeroSection.css';

/**
 * Bloque hero textual.
 * Conserva el mensaje principal del HTML original y su jerarquía semántica.
 */

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-top">
        <h1 className="titulo-principal">Calculadora de Solución Arterial</h1>
      </div>
      <p>Define los parámetros y obtén el resultado.</p>
    </section>
  );
});
