import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { publicUrl } from '../../utils/publicUrl';
import { SPOT, WORLD, COMPARE, PHARMA, CTA } from './adData';
import './AdShowcase.css';

const AdModel = lazy(() => import('./AdModel'));

/* ================================================================
   Advertising & Video: spot Don Tomás (cliente reale), il "mondo"
   del personaggio, il confronto clay/finale, poi i concept video AI
   per settori (farmacia) e l'invito a contattarti.
   Testi e file in adData.js.
   ================================================================ */

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => { setR(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  return r;
}

/* monta il contenuto solo quando entra nello schermo */
function useInView(ref, margin = '200px') {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return v;
}

function Hero() {
  const [playing, setPlaying] = useState(false);
  const v = useRef(null);
  const start = () => {
    setPlaying(true);
    requestAnimationFrame(() => v.current?.play().catch(() => {}));
  };
  return (
    <div className="ad-hero">
      {playing ? (
        <video ref={v} src={publicUrl(SPOT.video)} poster={publicUrl(SPOT.poster)} controls playsInline aria-label="Don Tomás spot" />
      ) : (
        <button type="button" className="ad-hero-btn" onClick={start} aria-label="Play the Don Tomás spot">
          <img src={publicUrl(SPOT.poster)} alt="" />
          <span className="ad-play" aria-hidden="true">▶</span>
          <span className="ad-dur">{SPOT.duration}</span>
        </button>
      )}
      <div className="ad-badges" aria-hidden={playing}>
        <span className="ad-client">Client</span>
        <span>{SPOT.client}</span>
      </div>
    </div>
  );
}

function ModelTile() {
  const ref = useRef(null);
  const show = useInView(ref);
  return (
    <div ref={ref} className="ad-tile ad-t3d">
      {show && (
        <Suspense fallback={null}>
          <AdModel url={WORLD.model.url} />
        </Suspense>
      )}
      <span className="ad-st">{WORLD.model.label}</span>
      <span className="ad-hint" aria-hidden="true">⟲ {WORLD.model.hint}</span>
    </div>
  );
}

function Tile({ t, reduced }) {
  const v = useRef(null);
  const ref = useRef(null);
  const show = useInView(ref, '0px');

  // il loop parte solo quando la scheda è visibile
  useEffect(() => {
    const el = v.current;
    if (!el || t.kind !== 'loop' || reduced || !show) return;
    el.play().catch(() => {});
  }, [t.kind, reduced, show]);

  const enter = () => {
    if (t.kind !== 'hover' || reduced || !v.current) return;
    v.current.currentTime = 0;
    v.current.play().catch(() => {});
  };

  return (
    <div ref={ref} className={`ad-tile ad-${t.area}`} onMouseEnter={enter} onFocus={enter} onClick={enter} tabIndex={t.kind === 'hover' ? 0 : undefined}>
      {t.video && show ? (
        <video
          ref={v}
          src={publicUrl(t.video)}
          poster={publicUrl(t.img)}
          muted
          playsInline
          loop={t.kind === 'loop'}
          preload="metadata"
          style={t.pos ? { objectPosition: t.pos } : undefined}
          aria-label={t.label}
        />
      ) : (
        <img src={publicUrl(t.img)} alt={t.label} loading="lazy" style={t.pos ? { objectPosition: t.pos } : undefined} />
      )}
      <span className={t.sticker === 'y' ? 'ad-st ad-st-y' : 'ad-st'}>{t.label}</span>
      {t.kind === 'loop' && <span className="ad-live">● Loop</span>}
      {t.kind === 'hover' && <span className="ad-hint" aria-hidden="true">▶ Hover or tap</span>}
    </div>
  );
}

function Compare() {
  const [x, setX] = useState(52);
  const box = useRef(null);
  const drag = useRef(false);
  const move = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setX(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="ad-cmp"
      onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={() => { drag.current = false; }}
    >
      <img src={publicUrl(COMPARE.final)} alt="Final frame of the spot" loading="lazy" draggable="false" />
      <img className="ad-cmp-r" style={{ clipPath: `inset(0 0 0 ${x}%)` }} src={publicUrl(COMPARE.clay)} alt="The same frame in Blender, clay render" loading="lazy" draggable="false" />
      <div className="ad-cmp-h" style={{ left: `${x}%` }}>
        <input
          type="range"
          min="4"
          max="96"
          value={Math.round(x)}
          onChange={(e) => setX(Number(e.target.value))}
          aria-label="Compare final frame and clay render"
        />
        <i aria-hidden="true">⇆</i>
      </div>
      <b className="ad-cmp-l">{COMPARE.left}</b>
      <b className="ad-cmp-rl">{COMPARE.right}</b>
    </div>
  );
}

function Player({ item, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <div className="ad-modal" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className="ad-modal-box" onClick={(e) => e.stopPropagation()}>
        <video src={publicUrl(item.video)} poster={publicUrl(item.img)} controls autoPlay playsInline />
        <div className="ad-modal-info">
          <b>{item.name}</b>
          <span>{item.time}</span>
        </div>
        <button ref={closeRef} type="button" className="ad-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    </div>,
    document.body,
  );
}

export default function AdShowcase() {
  const reduced = useReduced();
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section className="ad" aria-label="Advertising and video">
      <div className="ad-blk ad-dt">
        <Hero />
        <div className="ad-in">
          <p className="ad-ey">{SPOT.eyebrow}</p>
          <h2>{SPOT.title}</h2>
          <p className="ad-lead">{SPOT.text}</p>
          <ul className="ad-tags">{SPOT.tags.map((t) => <li key={t}>{t}</li>)}</ul>

          <div className="ad-world">
            <ModelTile />
            {WORLD.tiles.map((t) => <Tile key={t.id} t={t} reduced={reduced} />)}
          </div>

          <Compare />
        </div>
      </div>

      <div className="ad-blk ad-ph">
        <div className="ad-in">
          <span className="ad-lab">{PHARMA.badge}</span>
          <p className="ad-ey">{PHARMA.eyebrow}</p>
          <h2>{PHARMA.title}</h2>
          <p className="ad-lead">{PHARMA.text}</p>
          <div className="ad-fmt">
            {PHARMA.items.map((it) => (
              <button key={it.id} type="button" className="ad-card" onClick={() => setOpen(it)} aria-label={`Play ${it.name}`}>
                <span className="ad-card-im">
                  <img src={publicUrl(it.img)} alt="" loading="lazy" />
                  <i aria-hidden="true">▶</i>
                  <span>{it.time}</span>
                </span>
                <span className="ad-card-tx">
                  <b>{it.name}</b>
                  <span>{it.text}</span>
                  <span className="ad-chips">{it.tags.map((t) => <em key={t}>{t}</em>)}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="ad-cta">
            <div>
              <b>{CTA.title}</b>
              <span>{CTA.text}</span>
            </div>
            <a href={CTA.href}>{CTA.button} →</a>
          </div>
        </div>
      </div>

      {open && <Player item={open} onClose={close} />}
    </section>
  );
}
