/**
 * Hook de tema (claro/oscuro) con enfoque en fluidez móvil.
 *
 * Qué resuelve:
 * - Persiste preferencia en localStorage.
 * - Respeta modo del sistema cuando no hay preferencia guardada.
 * - Aplica transición liviana y evita efectos pesados en dispositivos modestos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { COARSE_POINTER_QUERY, REDUCED_MOTION_QUERY, SYSTEM_DARK_QUERY, THEME_STORAGE_KEY } from '../utils/constants';

type Theme = 'light' | 'dark';
type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number };

function parseCssDuration(value: string): number {
  const raw = String(value || '').trim();
  if (!raw) {
    return 0;
  }

  if (raw.endsWith('ms')) {
    return Number(raw.slice(0, -2));
  }

  if (raw.endsWith('s')) {
    return Number(raw.slice(0, -1)) * 1000;
  }

  return Number(raw);
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignoramos errores de almacenamiento en contextos privados/restringidos.
  }
}

function getMediaQueryMatch(query: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(query).matches;
}

function isLowEndTouchDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const nav = navigator as NavigatorWithDeviceMemory;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const isTouch = nav.maxTouchPoints > 0;

  return isTouch && (cores <= 4 || memory <= 4);
}

export function useTheme() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => getMediaQueryMatch(REDUCED_MOTION_QUERY));
  const [coarsePointer, setCoarsePointer] = useState<boolean>(() => getMediaQueryMatch(COARSE_POINTER_QUERY));

  const lowEndDevice = useMemo(() => isLowEndTouchDevice(), []);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const stored = getStoredTheme();
    if (stored) {
      return stored;
    }

    return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
  });

  const shouldUseNativeViewTransition = useMemo(() => {
    if (typeof document === 'undefined') {
      return false;
    }

    return typeof document.startViewTransition === 'function' && !reducedMotion && !coarsePointer && !lowEndDevice;
  }, [coarsePointer, lowEndDevice, reducedMotion]);

  const applyTheme = useCallback((nextTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
  }, []);

  const runThemeTransition = useCallback(
    (applyFn: () => void) => {
      const root = document.documentElement;
      const durationMs = parseCssDuration(getComputedStyle(root).getPropertyValue('--theme-switch-duration'));
      const shouldAnimate = !reducedMotion && durationMs > 0;

      if (!shouldAnimate) {
        applyFn();
        return;
      }

      root.classList.add('theme-switching');

      const finish = () => {
        window.setTimeout(() => {
          root.classList.remove('theme-switching');
        }, Math.max(0, durationMs));
      };

      if (shouldUseNativeViewTransition) {
        const transition = document.startViewTransition(() => {
          applyFn();
        });

        Promise.resolve(transition.finished)
          .catch(() => undefined)
          .finally(finish);

        return;
      }

      applyFn();
      finish();
    },
    [reducedMotion, shouldUseNativeViewTransition],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    runThemeTransition(() => {
      applyTheme(nextTheme);
      setStoredTheme(nextTheme);
      setTheme(nextTheme);
    });
  }, [applyTheme, runThemeTransition, theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      return () => reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    }

    reducedMotionQuery.addListener(handleReducedMotionChange);
    return () => reducedMotionQuery.removeListener(handleReducedMotionChange);
  }, []);

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia(COARSE_POINTER_QUERY);

    const handleCoarsePointerChange = (event: MediaQueryListEvent) => {
      setCoarsePointer(event.matches);
    };

    if (typeof coarsePointerQuery.addEventListener === 'function') {
      coarsePointerQuery.addEventListener('change', handleCoarsePointerChange);
      return () => coarsePointerQuery.removeEventListener('change', handleCoarsePointerChange);
    }

    coarsePointerQuery.addListener(handleCoarsePointerChange);
    return () => coarsePointerQuery.removeListener(handleCoarsePointerChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK_QUERY);

    const applySystemThemeChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme()) {
        return;
      }

      const nextTheme: Theme = event.matches ? 'dark' : 'light';

      runThemeTransition(() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      });
    };

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', applySystemThemeChange);
      return () => query.removeEventListener('change', applySystemThemeChange);
    }

    query.addListener(applySystemThemeChange);
    return () => query.removeListener(applySystemThemeChange);
  }, [applyTheme, runThemeTransition]);

  return { theme, toggleTheme };
}
