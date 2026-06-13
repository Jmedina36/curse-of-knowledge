import { useEffect } from 'react';

// Closes a modal when the user presses Escape.
// Pass enabled=false for modals that must not be dismissed (forced choices).
export default function useEscapeClose(onClose, enabled = true) {
  useEffect(() => {
    if (!enabled || !onClose) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, enabled]);
}
