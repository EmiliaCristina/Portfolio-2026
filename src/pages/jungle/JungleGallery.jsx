import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { publicUrl } from '../../utils/publicUrl';
import { HALL, PIECES, WALK } from './jungleData';
import './JungleGallery.css';

const JungleModel = lazy(() => import('./JungleModel'));

/* ================================================================
   Jungle's - galleria: un pezzo alla volta al centro, sotto un faro,
   con targhetta da museo. Per alcuni pezzi si può passare al modello
   3D vero (dagli STL di produzione). Sotto, il "making of".
   ================================================================ */

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="jg-lb" role="dialog" aria-modal="true" aria-label={item.label} onClick={onClose}>
      <div className="jg-lb-box" onClick={(e) => e.stopPropagation()}>
        {item.video ? (
          <video src={publicUrl(item.video)} poster={item.img ? publicUrl(item.img) : undefined} controls autoPlay playsInline />
        ) : (
          <img src={publicUrl(item.img)} alt={item.label} />
        )}
        {item.label && <p>{item.label}</p>}
      </div>
      <button type="button" className="jg-lb-close" aria-label="Close" onClick={onClose}>×</button>
    </div>,
    document.body,
  );
}

export default function JungleGallery() {
  const [i, setI] = useState(0);
  const [view, setView] = useState('render');
  const [lb, setLb] = useState(null);
  const listRef = useRef([]);
  const p = PIECES[i];

  const go = useCallback((n) => {
    setI((n + PIECES.length) % PIECES.length);
    setView('render');
  }, []);

  const onListKey = (e, k) => {
    let n = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (k + 1) % PIECES.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (k - 1 + PIECES.length) % PIECES.length;
    if (n === null) return;
    e.preventDefault();
    listRef.current[n]?.focus();
    go(n);
  };

  const closeLb = useCallback(() => setLb(null), []);

  return (
    <section className="jg" aria-label="Jungle's, the pieces">
      <figure className="jg-hall">
        <img src={publicUrl(HALL.img)} alt={HALL.alt} />
        <figcaption>{HALL.caption}</figcaption>
      </figure>

      <div className="jg-room">
        <div className="jg-intro">
          <p className="jg-eyebrow">The pieces</p>
          <h2>Designed in 3D,<br />built for the room.</h2>
          <p>Every signature piece started as a 3D model, was prepared for CNC milling or ironwork, and installed on site.</p>
        </div>

        <div className="jg-stage-wrap">
          <div className="jg-stage">
            <div className="jg-spot" aria-hidden="true" />
            {view === '3d' && p.model ? (
              <div className="jg-3d">
                <Suspense fallback={<div className="jg-loading">Loading 3D…</div>}>
                  <JungleModel key={p.id} model={p.model} />
                </Suspense>
                <span className="jg-hint" aria-hidden="true">Drag to rotate · scroll to zoom</span>
              </div>
            ) : (
              <img key={p.id} className="jg-art" src={publicUrl(p.img)} alt={`${p.name}: ${p.text}`} />
            )}

            <button type="button" className="jg-arrow jg-prev" aria-label="Previous piece" onClick={() => go(i - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="jg-arrow jg-next" aria-label="Next piece" onClick={() => go(i + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>

            {p.model && (
              <div className="jg-toggle" role="group" aria-label="View">
                <button type="button" aria-pressed={view === 'render'} onClick={() => setView('render')}>Render</button>
                <button type="button" aria-pressed={view === '3d'} onClick={() => setView('3d')}>3D · Rotate</button>
              </div>
            )}
          </div>

          <div className="jg-plate" key={`plate-${p.id}`} aria-live="polite">
            <h3>{p.name}</h3>
            <p className="jg-plate-meta">{p.plate}</p>
            <p className="jg-plate-text">{p.text}</p>
          </div>
        </div>

        <ol className="jg-list" aria-label="Pieces">
          {PIECES.map((pc, k) => (
            <li key={pc.id}>
              <button
                ref={(el) => { listRef.current[k] = el; }}
                type="button"
                aria-current={k === i ? 'true' : undefined}
                onClick={() => go(k)}
                onKeyDown={(e) => onListKey(e, k)}
              >
                <span>{String(k + 1).padStart(2, '0')}</span>{pc.name}
                {pc.model && <em>3D</em>}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="jg-making">
        <p className="jg-eyebrow">Making of · {p.name}</p>
        <div className="jg-strip" key={`mo-${p.id}`}>
          {p.making.map((m) => (
            <button type="button" key={m.label} className="jg-thumb" onClick={() => setLb(m)} aria-label={`Open: ${m.label}`}>
              <span className="jg-thumb-img">
                <img src={publicUrl(m.img)} alt="" loading="lazy" />
                {m.video && <i className="jg-play" aria-hidden="true">▶</i>}
              </span>
              <span className="jg-thumb-l">{m.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="jg-walk" onClick={() => setLb({ video: WALK.full, img: WALK.poster, label: 'Jungle Walk · interactive Unity walkthrough' })}>
          <span className="jg-walk-img">
            <video src={publicUrl(WALK.loop)} poster={publicUrl(WALK.poster)} muted loop playsInline autoPlay preload="metadata" />
          </span>
          <span>
            Jungle Walk · interactive Unity walkthrough <b aria-hidden="true">→</b>
            <small>The early concept, presented to the client before design development</small>
          </span>
        </button>
      </div>

      {lb && <Lightbox item={lb} onClose={closeLb} />}
    </section>
  );
}
