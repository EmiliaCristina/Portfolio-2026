import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { publicUrl } from '../../utils/publicUrl';
import { LB, MORE } from './brandData';
import './BrandBook.css';

/* ================================================================
   LB / Brand & Website - "brand book": logo animato, versioni del
   marchio, palette e font, stampa, sito WordPress e altri lavori
   brand + WordPress. Testi e immagini in brandData.js.
   ================================================================ */

function Arrow() {
  return <span aria-hidden="true" className="bb-arrow">↗</span>;
}

function Modal({ item, onClose }) {
  const [k, setK] = useState(0);
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'ArrowRight') setK((v) => (v + 1) % item.gallery.length);
      if (e.key === 'ArrowLeft') setK((v) => (v - 1 + item.gallery.length) % item.gallery.length);
    };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = prev; };
  }, [item, onClose]);

  return createPortal(
    <div className="bb-modal" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className="bb-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="bb-modal-img">
          <img key={k} src={publicUrl(item.gallery[k])} alt={`${item.name}, image ${k + 1}`} />
        </div>
        <div className="bb-modal-info">
          <h3>{item.name}</h3>
          <p>{item.text}</p>
          <ul className="bb-tags">{item.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          {item.gallery.length > 1 && (
            <div className="bb-dots" role="group" aria-label="Images">
              {item.gallery.map((g, i) => (
                <button key={g} type="button" aria-pressed={i === k} aria-label={`Image ${i + 1}`} onClick={() => setK(i)}>
                  <img src={publicUrl(g)} alt="" />
                </button>
              ))}
            </div>
          )}
          <a className="bb-cta" href={item.url} target="_blank" rel="noopener noreferrer">
            Visit the live site <Arrow />
          </a>
        </div>
        <button ref={closeRef} type="button" className="bb-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    </div>,
    document.body,
  );
}

export default function BrandBook() {
  const [open, setOpen] = useState(null);
  const [reduced, setReduced] = useState(false);
  const vid = useRef(null);
  const close = useCallback(() => setOpen(null), []);
  const { hero, mark, print, site } = LB;

  // Poppins, il font del brand LB: caricato a parte così un errore di rete non blocca la pagina
  useEffect(() => {
    const id = 'bb-poppins';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;800&display=swap';
    document.head.appendChild(l);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    const v = vid.current;
    if (!v || reduced) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section className="bb" aria-label="LB brand book">
      <div className="bb-hero">
        <div className="bb-hero-media">
          <video
            ref={vid}
            src={publicUrl(hero.video)}
            poster={publicUrl(hero.poster)}
            muted
            loop
            playsInline
            autoPlay={!reduced}
            preload="metadata"
            aria-label="LB logo animation"
          />
          <span className="bb-label">{hero.label}</span>
        </div>
        <div className="bb-hero-text">
          <p className="bb-eyebrow">{hero.eyebrow}</p>
          <h2>{hero.title}</h2>
          <p>{hero.text}</p>
        </div>
      </div>

      <div className="bb-sec">
        <h3>{mark.title}</h3>
        <div className="bb-versions">
          {mark.versions.map((v) => (
            <figure key={v.label} className={v.negative ? 'bb-tile bb-neg' : 'bb-tile'}>
              <img src={publicUrl(v.img)} alt={`LB logo, ${v.label}`} loading="lazy" />
              <figcaption>{v.label}</figcaption>
            </figure>
          ))}
        </div>
        <figure className="bb-tile bb-wide">
          <img src={publicUrl(mark.horizontal.img)} alt={`LB logo, ${mark.horizontal.label}`} loading="lazy" />
          <figcaption>{mark.horizontal.label}</figcaption>
        </figure>
        <div className="bb-row">
          <div className="bb-colors">
            {mark.colors.map((c) => (
              <div key={c.hex} style={{ background: c.hex, color: c.ink }}>
                <span>{c.name}</span>
                <span>{c.hex}</span>
              </div>
            ))}
          </div>
          <div className="bb-type">
            <b>{mark.type.sample}</b>
            <span>{mark.type.line}</span>
            <em>{mark.type.label}</em>
          </div>
        </div>
      </div>

      <div className="bb-sec">
        <h3>{print.title}</h3>
        <img className="bb-print" src={publicUrl(print.img)} alt={print.alt} loading="lazy" />
      </div>

      <div className="bb-sec bb-site">
        <div className="bb-device">
          <img className="bb-laptop" src={publicUrl(site.laptop)} alt="LB website on a laptop" loading="lazy" />
          <div className="bb-phone"><img src={publicUrl(site.phone)} alt="LB website on a phone" loading="lazy" /></div>
        </div>
        <div>
          <p className="bb-eyebrow">{site.eyebrow}</p>
          <h3>{site.title}</h3>
          <p className="bb-text">{site.text}</p>
          <ul className="bb-feat">{site.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <a className="bb-cta" href={LB.url} target="_blank" rel="noopener noreferrer">
            {site.cta} <Arrow />
          </a>
        </div>
      </div>

      <div className="bb-sec">
        <p className="bb-eyebrow">{MORE.eyebrow}</p>
        <h3>{MORE.title}</h3>
        <div className="bb-more">
          {MORE.items.map((it) => (
            <button key={it.id} type="button" className="bb-card" onClick={() => setOpen(it)} aria-label={`Open ${it.name}`}>
              <span className="bb-card-img">
                <img src={publicUrl(it.laptop)} alt="" loading="lazy" />
                <span className="bb-phone bb-phone-sm"><img src={publicUrl(it.phone)} alt="" loading="lazy" /></span>
              </span>
              <span className="bb-card-name">{it.name}</span>
              <span className="bb-card-sub">{it.sub}</span>
              <span className="bb-tags">{it.tags.map((t) => <span key={t}>{t}</span>)}</span>
            </button>
          ))}
        </div>
      </div>

      {open && <Modal item={open} onClose={close} />}
    </section>
  );
}
