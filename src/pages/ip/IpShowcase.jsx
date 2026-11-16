import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicUrl } from '../../utils/publicUrl';
import { HERO, EVOLUTION, HOOD } from './ipData';
import './IpShowcase.css';

const IpModel = lazy(() => import('./IpModel'));

/* ================================================================
   Interactive 3D Portfolio: la home in azione, il passaggio
   dall'alter ego all'avatar per il web, e Emi da girare.
   Testi e file in ipData.js.
   ================================================================ */

function useInView(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return v;
}

export default function IpShowcase() {
  const [mode, setMode] = useState('clay');
  const [ex, setEx] = useState(0);
  const stage = useRef(null);
  const show = useInView(stage);

  const pick = (id) => {
    if (id === 'face' && mode === 'face') setEx((v) => (v + 1) % HOOD.expressions.length);
    setMode(id);
  };

  return (
    <section className="ip" aria-label="Interactive 3D portfolio, behind the scenes">
      <div className="ip-blk">
        <div className="ip-hero">
          {HERO.video ? (
            <video src={publicUrl(HERO.video)} poster={publicUrl(HERO.poster)} muted loop playsInline autoPlay aria-label="The home page in action" />
          ) : (
            <img src={publicUrl(HERO.poster)} alt="The home page: Emi with a monitor head and bunny ears" />
          )}
          <span className="ip-badge"><i aria-hidden="true">●</i> {HERO.badge}</span>
          <Link className="ip-try" to="/">{HERO.cta} →</Link>
        </div>

        <div className="ip-in">
          <p className="ip-ey">{EVOLUTION.eyebrow}</p>
          <h2>{EVOLUTION.title}</h2>
          <p className="ip-lead">{EVOLUTION.text}</p>
          <div className="ip-evo">
            <figure className="ip-card">
              <img src={publicUrl(EVOLUTION.before.img)} alt="My alter ego in a fur hoodie, offline render" loading="lazy" />
              <figcaption><b>{EVOLUTION.before.label}</b><span>{EVOLUTION.before.tag}</span></figcaption>
            </figure>
            <span className="ip-arrow" aria-hidden="true">→</span>
            <figure className="ip-card ip-card-web">
              <img src={publicUrl(EVOLUTION.after.img)} alt="The web avatar with a monitor head, showing my alter ego on its screen" loading="lazy" />
              <figcaption><b>{EVOLUTION.after.label}</b><span>{EVOLUTION.after.tag}</span></figcaption>
            </figure>
          </div>
          <ul className="ip-stats">
            {EVOLUTION.stats.map((s) => <li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>)}
          </ul>
        </div>
      </div>

      <div className="ip-blk">
        <div className="ip-in">
          <p className="ip-ey">{HOOD.eyebrow}</p>
          <h2>{HOOD.title}</h2>
          <div className="ip-hood">
            <div ref={stage} className="ip-stage">
              {show && (
                <Suspense fallback={null}>
                  <IpModel url={HOOD.model} mode={mode} expression={HOOD.expressions[ex]} />
                </Suspense>
              )}
              <span className="ip-hint" aria-hidden="true">⟲ Drag to rotate</span>
              <div className="ip-tog" role="group" aria-label="View mode">
                {HOOD.modes.map((m) => (
                  <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => pick(m.id)}>
                    {m.label}{m.id === 'face' && mode === 'face' ? ' ↻' : ''}
                  </button>
                ))}
              </div>
            </div>
            <ul className="ip-feat">
              {HOOD.features.map((f) => (
                <li key={f.title}><i aria-hidden="true">{f.icon}</i><b>{f.title}</b><span>{f.text}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
