/**
 * Reproducción de audio de bienvenida (una sola vez).
 * Respeta políticas del navegador: intenta autoplay y cae a interacción del usuario.
 */

import { useEffect, useRef } from 'react';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.55;
    audio.load();

    let alreadyPlayed = false;
    let pendingAttempt = false;

    const removeFallbackListeners = () => {
      document.removeEventListener('pointerdown', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('keydown', playOnInteraction);
    };

    const tryPlay = async (logBlocked = false) => {
      if (alreadyPlayed || pendingAttempt) {
        return;
      }

      pendingAttempt = true;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        try {
          await playPromise;
          alreadyPlayed = true;
          removeFallbackListeners();
        } catch {
          if (logBlocked) {
            // No mostramos error visual para mantener la experiencia original.
            console.log('El navegador bloqueó la reproducción automática.');
          }
        } finally {
          pendingAttempt = false;
        }

        return;
      }

      alreadyPlayed = true;
      pendingAttempt = false;
      removeFallbackListeners();
    };

    const playOnInteraction = () => {
      void tryPlay(false);
    };

    document.addEventListener('pointerdown', playOnInteraction, { passive: true });
    document.addEventListener('touchstart', playOnInteraction, { passive: true });
    document.addEventListener('click', playOnInteraction, { passive: true });
    document.addEventListener('keydown', playOnInteraction);

    void tryPlay(true);

    const handleCanPlay = () => {
      void tryPlay(true);
    };

    audio.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      removeFallbackListeners();
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return <audio id="audioCarga" ref={audioRef} src="/assets/audio/sonido.mp3" preload="auto" playsInline></audio>;
}
