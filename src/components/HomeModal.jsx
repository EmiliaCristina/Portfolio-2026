import { useEffect, useState } from 'react';
import { useModalStore } from '../ModalStore';
import WorkGridContent from '../pages/content/WorkGridContent';
import WorkDetailContent from '../pages/content/WorkDetailContent';
import WhatIDoContent from '../pages/content/WhatIDoContent';
import AboutContent from '../pages/content/AboutContent';
import { workProjects } from '../pages/workData';
import './HomeModal.css';

const TITLES = {
  work: 'My Work',
  'what-i-do': 'What I Do',
  about: 'About Me',
};

/**
 * La "scheda" popup che si apre sopra alla home invece di navigare a
 * una pagina separata: stessi contenuti delle pagine /work, /what-i-do,
 * /about (riusati da src/pages/content/*), ma dentro a un pannello con
 * sfondo sfocato che lascia intravedere Emi dietro, con apertura e
 * chiusura animate.
 */
const HomeModal = () => {
  const { page, workId, close, openWork, closeWork } = useModalStore();

  // Il pannello resta montato un attimo in più della sua "vita logica"
  // (page !== null) per poter fare l'animazione di chiusura invece di
  // sparire di scatto.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (page) {
      setMounted(true);
      // doppio rAF: assicura che il browser applichi prima lo stato
      // "invisibile" e poi faccia partire la transizione verso visibile.
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chiudi con Esc, per chi naviga da tastiera.
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, close]);

  // Blocca lo scroll del contenuto dietro mentre il popup è aperto.
  useEffect(() => {
    if (mounted) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mounted]);

  if (!mounted) return null;

  const project =
    page === 'work' && workId
      ? workProjects.find((p) => p.id === workId)
      : null;

  return (
    <div
      className={`home-modal-backdrop${visible ? ' home-modal-backdrop--visible' : ''}`}
      onClick={close}
    >
      <div
        className={`home-modal-panel${visible ? ' home-modal-panel--visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="home-modal-topbar">
          <span className="home-modal-title">{TITLES[page]}</span>
          <button
            type="button"
            className="home-modal-close"
            aria-label="Chiudi"
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className="home-modal-body">
          {page === 'work' &&
            (project ? (
              <WorkDetailContent
                project={project}
                onBack={closeWork}
                backLabel="Torna a My Work"
              />
            ) : (
              <WorkGridContent onSelect={(p) => openWork(p.id)} />
            ))}
          {page === 'what-i-do' && <WhatIDoContent />}
          {page === 'about' && <AboutContent />}
        </div>
      </div>
    </div>
  );
};

export default HomeModal;
