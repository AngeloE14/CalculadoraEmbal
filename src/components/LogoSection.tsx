import { memo } from 'react';

/**
 * Bloque visual del logotipo.
 * Se mantiene casi idéntico al original para preservar identidad de marca.
 */

export const LogoSection = memo(function LogoSection() {
  const logoSrc = 'assets/images/logo-circular.png';

  return (
    <section className="logo-head" aria-label="Logo institucional">
      <div className="logo-season logo-season--spring">
        <div className="spring-petals" aria-hidden="true">
          <span className="spring-petal spring-petal--1"></span>
          <span className="spring-petal spring-petal--2"></span>
          <span className="spring-petal spring-petal--3"></span>
          <span className="spring-petal spring-petal--4"></span>
          <span className="spring-petal spring-petal--5"></span>
          <span className="spring-petal spring-petal--6"></span>
        </div>
        <img
          src={logoSrc}
          alt="Logo Escuela de Artes Mortuorias del Sureste"
          width={220}
          height={220}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </section>
  );
});
