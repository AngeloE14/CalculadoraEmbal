/**
 * Acciones para compartir resultados.
 * Conserva la idea original: botón + mensaje de feedback inmediato.
 */

import { memo } from 'react';

interface ShareActionsProps {
  shareFeedback: string;
  onShare: () => void;
}

export const ShareActions = memo(function ShareActions({ shareFeedback, onShare }: ShareActionsProps) {
  return (
    <div className="share-actions">
      <button className="share-button boton-principal" id="shareResultButton" type="button" onClick={onShare}>
        📤 Compartir resultado
      </button>

      <p
        className="share-feedback"
        id="shareFeedback"
        role="status"
        aria-live="polite"
        style={{ display: shareFeedback ? 'flex' : 'none' }}
      >
        <img src="/assets/images/logo-circular.png" alt="Logo CalcEmbal" width={24} height={24} loading="lazy" decoding="async" />
        <span id="shareFeedbackText">{shareFeedback}</span>
      </p>
    </div>
  );
});
