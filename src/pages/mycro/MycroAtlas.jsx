import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import MycroScene, { rotateBy, HOME } from './MycroScene';
import { createPortal } from 'react-dom';
import { STAGES, SWATCHES, CLOSEUP, PIPELINE_IMG, PRINTS, cropStyle } from './mycroAtlasData';
import { publicUrl } from '../../utils/publicUrl';
import './MycroAtlas.css';

/* ================================================================
   Mycro Atlas: il principio di Feather Atlas (viewer 3D al centro,
   tab sopra, scheda a destra) applicato alla pipeline di Mycro.
   ================================================================ */

const ICONS = {
  zin: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M10.5 7.8v5.4M7.8 10.5h5.4" /></>,
  zout: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M7.8 10.5h5.4" /></>,
  expand: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  ccw: <><path d="M3.8 12A8.2 8.2 0 1 0 6.2 6.2L3.8 8.6" /><path d="M3.8 3.8v4.8h4.8" /></>,
  cw: <><path d="M20.2 12a8.2 8.2 0 1 1-2.4-5.8l2.4 2.4" /><path d="M20.2 3.8v4.8h-4.8" /></>,
  hand: <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V12m0-2.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.2l-2.7-3.2a1.6 1.6 0 0 1 2.4-2.1L8 15" />,
  chev: <path d="m9 6 6 6-6 6" />,
  tool: <path d="M14.5 5.5a4 4 0 0 0-5.3 5.3L3.5 16.5a1.8 1.8 0 0 0 2.5 2.5l5.7-5.7a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.1-.5-.5-2.1Z" />,
  mesh: <><path d="M4 4h16v16H4z" /><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16" /></>,
  parts: <><path d="M4 8.5 8.5 6 13 8.5v5L8.5 16 4 13.5Z" /><path d="m13 12.5 3.5-2 3.5 2v4.5L16.5 19 13 17Z" /></>,
  flow: <path d="M3.5 12h5M15.5 12h5M10.5 12h3M8.5 9.5 11 12l-2.5 2.5M18 9.5l2.5 2.5-2.5 2.5" />,
  box: <><path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" /><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 1.8-.9 1.4-1.9-.5-1.2.3-2.4 1.6-2.4h1.7a3.8 3.8 0 0 0 3.8-3.8c0-4.9-3.8-8.9-8.5-8.9Z" /><circle cx="8" cy="11" r="1" /><circle cx="11" cy="7.5" r="1" /><circle cx="15.5" cy="8.5" r="1" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" /></>,
  restore: <><path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.7" /><path d="M4 4v4.7h4.7" /><circle cx="12" cy="12" r="2.2" /></>,
  explode: <><path d="M9 4h6v5H9zM3 14h6v6H3zM15 14h6v6h-6z" /><path d="M12 9v2M9 14l1.5-2M15 14l-1.5-2" /></>,
  assemble: <><path d="M8 6h8v5H8zM6 11h6v7H6zM12 11h6v7h-6z" /></>,
};

const Icon = ({ name, className = 'ma-ic' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>
);

class ViewerBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.warn('Mycro Atlas: could not load the 3D model', err); this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const ZMIN = 0.55;
const ZMAX = 3.4;
const clampZ = (z) => Math.min(ZMAX, Math.max(ZMIN, z));

export default function MycroAtlas() {
  const reducedInit = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctl = useRef({
    phase: 'final', wipe: null, zoom: 1, zoomT: 1, fit: 1, ex: 0, assembled: false,
    vel: { x: 0, y: 0 }, queue: 0, homing: false, dragging: false, pts: 0,
    yaw: HOME.yaw, pitch: HOME.pitch, pan: 0, panT: 0, canPan: false, viewH: 1,
    lastInteract: performance.now(), idle: 0, dusk: false, reduced: reducedInit, spin: null,
  });

  const [active, setActive] = useState(3);
  const [shown, setShown] = useState(3);
  const [leaving, setLeaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [zi, setZi] = useState(true);
  const [cu, setCu] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dusk, setDusk] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [hinted, setHinted] = useState(false);

  const root = useRef(null);
  const stage = useRef(null);
  const tabsRef = useRef([]);
  const detailRef = useRef(null);

  /* ---- prefers-reduced-motion ---- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = (e) => { ctl.current.reduced = e.matches; };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const interact = useCallback(() => {
    ctl.current.lastInteract = performance.now();
    setHinted(true);
  }, []);
  const setZoom = useCallback((z) => { ctl.current.zoomT = clampZ(z); }, []);
  // Restore position: rotazione, zoom e scorrimento tornano allo stato iniziale
  const goHome = useCallback(() => {
    const c = ctl.current;
    c.homing = true; c.vel.x = c.vel.y = 0; c.queue = 0; c.zoomT = 1; c.panT = 0;
    interact();
  }, [interact]);

  const onUi = useCallback((u) => {
    if ('loaded' in u) setLoaded(true);
    if ('zi' in u) setZi(u.zi);
    if ('cu' in u) setCu(u.cu);
  }, []);

  /* ---- cambio fase ---- */
  const select = useCallback((n) => {
    if (n === active) return;
    const c = ctl.current;
    const from = c.wipe ? c.wipe.to : c.phase;
    const to = STAGES[n].id;
    c.wipe = c.reduced || !c.spin ? null : { from, to, t0: performance.now() };
    c.phase = to;
    c.assembled = false; setAssembled(false);
    c.vel.x = c.vel.y = 0; c.queue = 0; c.zoomT = 1;
    interact();
    setActive(n);
  }, [active, interact]);

  /* ---- swap della scheda con dissolvenza (come Feather Atlas) ---- */
  useEffect(() => {
    if (active === shown) return;
    if (ctl.current.reduced) { setShown(active); return; }
    setLeaving(true);
    const t = setTimeout(() => {
      setShown(active); setLeaving(false);
      if (detailRef.current) detailRef.current.scrollTop = 0;
    }, 200);
    return () => clearTimeout(t);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFocus = useCallback((force) => {
    setFocus((f) => (typeof force === 'boolean' ? force : !f));
    interact();
  }, [interact]);
  const toggleDusk = () => {
    ctl.current.dusk = !ctl.current.dusk;
    setDusk(ctl.current.dusk);
    interact();
  };
  const toggleAssemble = () => {
    ctl.current.assembled = !ctl.current.assembled;
    setAssembled(ctl.current.assembled);
    interact();
  };

  useEffect(() => {
    if (!focus) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); toggleFocus(false); }
    };
    // capture: così Esc chiude prima la vista espansa e non il popup
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [focus, toggleFocus]);

  /* ---- puntatore: trascina per ruotare, pizzica per lo zoom ---- */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const c = ctl.current;
    const pts = new Map();
    let pinchD = 0, lastMoveT = 0, lastEvT = 0;
    const canGrab = (t) => !t.closest('button, a');
    const pinchDist = () => {
      const [a, b] = [...pts.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (pts.size === 0 && !canGrab(e.target)) return;
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      c.pts = pts.size;
      interact(); c.homing = false;
      if (pts.size === 1) {
        c.dragging = true; c.vel.x = c.vel.y = 0; lastEvT = e.timeStamp;
        el.classList.add('is-grabbing');
      } else if (pts.size === 2) {
        c.dragging = false; c.vel.x = c.vel.y = 0; pinchD = pinchDist();
      }
    };
    const move = (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 1 && c.dragging) {
        const k = Math.PI / Math.max(260, el.clientHeight * 0.9);
        const dt = Math.max(0.008, (e.timeStamp - lastEvT) / 1000);
        lastEvT = e.timeStamp;
        if (c.canPan) {
          // ingranditi: in verticale si scorre lungo il modello
          rotateBy(c, dx * k, 0);
          c.panT += dy * (c.viewH / Math.max(1, el.clientHeight));
          c.vel.x = 0;
        } else {
          rotateBy(c, dx * k, dy * k);
          c.vel.x = c.vel.x * 0.5 + ((dy * k) / dt) * 0.5;
        }
        c.vel.y = c.vel.y * 0.5 + ((dx * k) / dt) * 0.5;
        lastMoveT = performance.now();
        interact();
      } else if (pts.size >= 2) {
        const d = pinchDist();
        if (pinchD > 0 && d > 0) c.zoomT = clampZ(c.zoomT * (d / pinchD));
        pinchD = d;
        interact();
      }
    };
    const end = (e) => {
      if (!pts.delete(e.pointerId)) return;
      c.pts = pts.size;
      if (pts.size === 0) {
        c.dragging = false;
        el.classList.remove('is-grabbing');
        if (performance.now() - lastMoveT > 90) c.vel.x = c.vel.y = 0;
        const cap = 12;
        c.vel.x = Math.max(-cap, Math.min(cap, c.vel.x));
        c.vel.y = Math.max(-cap, Math.min(cap, c.vel.y));
      } else if (pts.size === 1) {
        c.dragging = true; c.vel.x = c.vel.y = 0; lastEvT = e.timeStamp;
      }
    };
    // Rotella: zoom. Arrivati al limite, la rotella torna a far scorrere
    // la pagina invece di restare "intrappolata" nel viewer.
    const wheel = (e) => {
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      const next = clampZ(c.zoomT * Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0016)));
      if (next === c.zoomT && !e.ctrlKey) return;
      e.preventDefault();
      c.zoomT = next;
      interact();
    };
    const dbl = (e) => { if (canGrab(e.target)) goHome(); };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => el.addEventListener(t, end));
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('dblclick', dbl);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => el.removeEventListener(t, end));
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('dblclick', dbl);
    };
  }, [interact, goHome]);

  const onStageKey = (e) => {
    const c = ctl.current;
    const s = 0.18;
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft': rotateBy(c, -s, 0); break;
      case 'ArrowRight': rotateBy(c, s, 0); break;
      case 'ArrowUp': if (c.canPan) c.panT -= c.viewH * 0.12; else rotateBy(c, 0, -s); break;
      case 'ArrowDown': if (c.canPan) c.panT += c.viewH * 0.12; else rotateBy(c, 0, s); break;
      case '+': case '=': setZoom(c.zoomT * 1.2); break;
      case '-': case '_': setZoom(c.zoomT / 1.2); break;
      case '0': goHome(); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); if (e.key !== '0') { c.homing = false; interact(); } }
  };

  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + STAGES.length) % STAGES.length;
    tabsRef.current[n]?.focus();
    select(n);
  };

  const turn = (a) => { interact(); ctl.current.homing = false; ctl.current.queue += a; };

  const s = STAGES[shown];
  const img = publicUrl(PIPELINE_IMG);
  const isPrint = STAGES[active].id === 'print';

  const cls = [
    'ma',
    focus && 'is-focus',
    !loaded && !failed && 'is-loading',
    failed && 'is-failed',
  ].filter(Boolean).join(' ');

  return (
    <section ref={root} className={cls} data-light={dusk ? 'dusk' : 'day'} aria-label="Mycro, interactive 3D pipeline">
      <div className="ma-main">
        <div className="ma-tabs" role="tablist" aria-label="Pipeline stages">
          {STAGES.map((st, i) => (
            <button
              key={st.id}
              ref={(el) => { tabsRef.current[i] = el; }}
              type="button"
              role="tab"
              id={`ma-tab-${st.id}`}
              className="ma-tab"
              aria-selected={i === active}
              aria-controls="ma-detail"
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="ma-thumb" style={cropStyle(img, st.crop, 52, 48)} aria-hidden="true" />
              <span className="ma-tn"><span className="ma-tnum">0{i + 1}</span>{st.name}</span>
              <span className="ma-tl">{st.sub}</span>
            </button>
          ))}
        </div>

        <div
          ref={stage}
          className="ma-stage"
          tabIndex={0}
          role="application"
          aria-roledescription="3D viewer"
          aria-label="3D viewer of Mycro. Drag to turn, scroll or pinch to zoom, double-click to reset. Arrow keys rotate, plus and minus zoom, 0 resets."
          onKeyDown={onStageKey}
        >
          <div className="ma-ground" aria-hidden="true" />
          <div className="ma-canvas">
            <ViewerBoundary onFail={() => setFailed(true)}>
              <Canvas
                dpr={[1, 2]}
                camera={{ fov: 28, near: 0.01, far: 50, position: [0, 0, 3] }}
                gl={{ antialias: true, alpha: true }}
                onCreated={({ gl }) => {
                  gl.setClearColor(0x000000, 0);
                  gl.toneMapping = THREE.NeutralToneMapping;
                  gl.toneMappingExposure = 1.0;
                }}
              >
                <Suspense fallback={null}>
                  <MycroScene ctl={ctl} onUi={onUi} />
                </Suspense>
              </Canvas>
            </ViewerBoundary>
          </div>

          <div className="ma-loader" aria-hidden="true"><i /><span>Preparing Mycro…</span></div>
          <img className="ma-fallback" src={publicUrl('/images/3dPrint.webp')} alt={failed ? 'Mycro, painted 3D-printed figure' : ''} />
          <div className={`ma-hint${hinted ? ' is-gone' : ''}`} aria-hidden="true">
            <Icon name="hand" />Drag to turn · scroll to zoom · drag up/down when zoomed
          </div>

          <div className="ma-rail">
            <button type="button" className={`ma-rbtn${zi ? ' is-on' : ''}`} aria-label="Zoom in" aria-pressed={zi}
              onClick={() => { interact(); setZoom(ctl.current.zoomT * 1.35); }}><Icon name="zin" /></button>
            <button type="button" className={`ma-rbtn${!zi ? ' is-on' : ''}`} aria-label="Zoom out" aria-pressed={!zi}
              onClick={() => { interact(); setZoom(ctl.current.zoomT / 1.35); }}><Icon name="zout" /></button>
            <button type="button" className={`ma-rbtn${focus ? ' is-on' : ''}`} aria-label="Expand view" aria-pressed={focus}
              onClick={() => toggleFocus()}><Icon name="expand" /></button>
            <button type="button" className={`ma-rbtn${dusk ? ' is-on' : ''}`} aria-label="Toggle dusk lighting" aria-pressed={dusk}
              onClick={toggleDusk}><Icon name="sun" /></button>
            <button type="button" className="ma-rbtn ma-restore" aria-label="Restore position" title="Restore position"
              onClick={goHome}><Icon name="restore" /></button>
          </div>

          <div className="ma-turn">
            <button type="button" aria-label="Turn 90 degrees left" onClick={() => turn(-Math.PI / 2)}><Icon name="ccw" /></button>
            <button type="button" aria-label="Turn a full 360 degrees" onClick={() => turn(Math.PI * 2)}>360°</button>
            <button type="button" aria-label="Turn 90 degrees right" onClick={() => turn(Math.PI / 2)}><Icon name="cw" /></button>
            {isPrint && (
              <button type="button" className="ma-assemble" aria-pressed={assembled} onClick={toggleAssemble}>
                <Icon name={assembled ? 'explode' : 'assemble'} />
                <span>{assembled ? 'Explode' : 'Assemble'}</span>
              </button>
            )}
          </div>

          <p className={`ma-caption${leaving ? ' is-out' : ''}`} key={`c-${shown}`}>{s.caption}</p>
        </div>
      </div>

      <div className="ma-info">
        <div className="ma-detail" id="ma-detail" ref={detailRef} role="tabpanel" aria-labelledby={`ma-tab-${STAGES[active].id}`}>
          <article className={`ma-article${leaving ? ' is-out' : ''}`} key={shown} aria-live="polite">
            <p className="ma-eyebrow" style={{ '--i': 0 }}>{s.eyebrow}</p>
            <h2 className="ma-h1" style={{ '--i': 1 }}>{s.name}</h2>
            <ul className="ma-tags" style={{ '--i': 2 }}>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="ma-desc" style={{ '--i': 3 }}>{s.desc}</p>
            <h3 className="ma-h2" style={{ '--i': 4 }}>Key Traits</h3>
            <dl className="ma-traits" style={{ '--i': 5 }}>
              {s.traits.map((t) => (
                <div className="ma-trait" key={t.label}>
                  <Icon name={t.icon} />
                  <dt>{t.label}</dt>
                  <dd>
                    {t.value === 'swatches' ? (
                      <span className="ma-swatches">
                        {SWATCHES.map((c) => <i key={c} style={{ background: c }} />)}
                      </span>
                    ) : t.value}
                  </dd>
                </div>
              ))}
            </dl>
            {s.id === 'print' && (
              <div className="ma-prints" style={{ '--i': 6 }}>
                <h3 className="ma-h2">From the printer</h3>
                <div className="ma-prints-row">
                  {PRINTS.map((p) => (
                    <button key={p.img} type="button" onClick={() => setPhoto(p)} aria-label={`Open photo: ${p.label}`}>
                      <img src={publicUrl(p.img)} alt="" loading="lazy" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              className="ma-closeup"
              style={{ '--i': 6 }}
              aria-pressed={cu}
              onClick={() => { interact(); goHomeIfFar(ctl.current); ctl.current.panT = 0; setZoom(ctl.current.zoomT > 2.2 ? 1 : 2.6); }}
            >
              <span className="ma-lens" style={cropStyle(img, CLOSEUP.crop, 76, 76)} aria-hidden="true" />
              <span>
                <span className="ma-ct">Close-up Detail</span>
                <span className="ma-cd"><strong>{CLOSEUP.title}.</strong> {CLOSEUP.text}</span>
              </span>
              <Icon name="chev" className="ma-ic ma-chev" />
            </button>
          </article>
        </div>
      </div>
      {photo && <PhotoBox item={photo} onClose={() => setPhoto(null)} />}
    </section>
  );
}

function PhotoBox({ item, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <div className="ma-photo" role="dialog" aria-modal="true" aria-label={item.label} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={publicUrl(item.img)} alt={`Mycro, ${item.label}`} />
        <figcaption>{item.label}</figcaption>
        <button ref={ref} type="button" aria-label="Close" onClick={onClose}>×</button>
      </figure>
    </div>,
    document.body,
  );
}

// Il close-up inquadra la turbina sul petto: se Mycro è girato di
// schiena, prima lo riporta frontale.
function goHomeIfFar(c) {
  // componente frontale dopo la rotazione (yaw/pitch)
  const z = Math.cos(c.yaw) * Math.cos(c.pitch);
  if (z < 0.6) { c.homing = true; c.vel.x = c.vel.y = 0; c.queue = 0; }
}
