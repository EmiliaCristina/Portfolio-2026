import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { publicUrl } from '../utils/publicUrl';
import './CharacterReel.css';

/* ================================================================
   Testata della scheda "3D Characters": estratto dello showreel muto e
   in loop (leggero, parte da solo) + pulsante che apre il video
   completo con l'audio in una finestra sopra la pagina.
   Il video completo si scarica solo quando qualcuno lo apre.
   ================================================================ */

export default function CharacterReel({ loop, full, poster, title = 'Character Showreel' }) {
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const loopRef = useRef(null);
  const fullRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // il loop gira solo quando è visibile (risparmia batteria e CPU)
  useEffect(() => {
    const v = loopRef.current;
    if (!v || reduced) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !open) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, open]);

  // finestra: Esc chiude (in cattura, così non chiude anche il popup del sito)
  useEffect(() => {
    if (!open) return undefined;
    loopRef.current?.pause();
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      openerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="creel">
        <video
          ref={loopRef}
          className="creel-video"
          src={publicUrl(loop)}
          poster={publicUrl(poster)}
          muted
          loop
          playsInline
          autoPlay={!reduced}
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="creel-shade" aria-hidden="true" />
        <div className="creel-bar">
          <div>
            <p className="creel-eyebrow">Showreel</p>
            <p className="creel-title">{title}</p>
          </div>
          <button ref={openerRef} type="button" className="creel-play" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z" /></svg>
            Watch full showreel
          </button>
        </div>
      </div>

      {open && createPortal(
        <div
          className="creel-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="creel-frame">
            <video ref={fullRef} className="creel-full" src={publicUrl(full)} poster={publicUrl(poster)} controls autoPlay playsInline />
            <button ref={closeRef} type="button" className="creel-close" aria-label="Close showreel" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
