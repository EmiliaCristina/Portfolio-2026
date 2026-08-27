import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useDialogueStore } from '../DialogueEngine';
import { useModalStore, HASH_TO_MODAL_PAGE } from '../ModalStore';

// Import delle icone social
import { FaLinkedinIn, FaArtstation, FaWhatsapp } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';

// Importa l'asset: Vite/Webpack gestirà il percorso corretto
import AMBIENT_SRC from '../assets/emi/fx/ambient.mp3';

/* ------------------------------------------------------------------ */
/*  SplitText typewriter                                              */
/* ------------------------------------------------------------------ */

function splitToChars(container, text) {
  container.innerHTML = '';
  const spans = [];
  const words = text.split(' ');

  words.forEach((word, wordIndex) => {
    const wordWrap = document.createElement('span');
    wordWrap.style.display = 'inline-block';
    wordWrap.style.whiteSpace = 'nowrap';

    [...word].forEach((char) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.style.display = 'inline-block';
      charSpan.style.opacity = '0';
      charSpan.style.transform = 'translateY(0.4em)';
      wordWrap.appendChild(charSpan);
      spans.push(charSpan);
    });

    container.appendChild(wordWrap);
    if (wordIndex < words.length - 1) {
      container.appendChild(document.createTextNode('\u00A0'));
    }
  });

  return spans;
}

function useTypewriter(text) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const { setTyping, finishTyping } = useDialogueStore((s) => ({
    setTyping: s.setTyping,
    finishTyping: s.finishTyping,
  }));

  useEffect(() => {
    if (!containerRef.current || !text) return undefined;

    timelineRef.current?.kill();
    setTyping(true);

    const chars = splitToChars(containerRef.current, text);

    timelineRef.current = gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      stagger: 0.018,
      onComplete: () => finishTyping(),
    });

    return () => timelineRef.current?.kill();
  }, [text]);

  return containerRef;
}

/* ------------------------------------------------------------------ */
/*  Audio controller                                                  */
/* ------------------------------------------------------------------ */

function useAmbientAudio() {
  const audioRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio(AMBIENT_SRC);
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const unlock = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current
      .play()
      .then(() => setUnlocked(true))
      .catch((err) => console.warn('Errore riproduzione audio:', err));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  }, []);

  return { unlock, toggleMute, muted, unlocked };
}

/* ------------------------------------------------------------------ */
/*  Overlay                                                           */
/* ------------------------------------------------------------------ */

export default function Overlay() {
  const {
    currentNode,
    hasStarted,
    start,
    choose,
    goBack,
    history,
    isTyping,
    showCursor,
  } = useDialogueStore((s) => ({
    currentNode: s.currentNode,
    hasStarted: s.hasStarted,
    start: s.start,
    choose: s.choose,
    goBack: s.goBack,
    history: s.history,
    isTyping: s.isTyping,
    showCursor: s.showCursor,
  }));

  const node = currentNode();
  const textRef = useTypewriter(hasStarted ? node.line : '');
  const { unlock, toggleMute, muted } = useAmbientAudio();

  const panelRef = useRef(null);

  useEffect(() => {
    if (hasStarted && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [hasStarted]);

  useEffect(() => {
    const handleUserGesture = () => {
      unlock();
    };

    window.addEventListener('click', handleUserGesture, { once: true });
    window.addEventListener('keydown', handleUserGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, [unlock]);

  return (
    <div className={`c-emi_main ${hasStarted ? 'is-active' : 'is-idle'}`}>
      
      {/* Scritta fissa in alto a destra sempre presente sullo schermo */}
      <div className="portfolio-watermark">
        Portfolio 2026
      </div>

      {hasStarted && (
        <div className="c-emi_panel" ref={panelRef}>
          <p className="c-emi_eyebrow">{node.title}</p>
          <div
            className={`c-emi-step ${showCursor ? '-show-cursor' : ''}`}
            key={node.id}
          >
            <span className="c-emi-step_text" ref={textRef} />
            <span className="c-emi-step_cursor" aria-hidden="true" />
          </div>

          {!isTyping && node.choices?.length > 0 && (
            <div className="c-emi_choices">
              {node.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  className="c-emi_choice"
                  onClick={(e) => {
                    e.stopPropagation();

                    // Le pagine "interne" (Work/What I Do/About) si
                    // aprono come scheda popup sopra alla home, senza
                    // navigare via: si resta sempre nella stessa pagina.
                    const modalPage = HASH_TO_MODAL_PAGE[choice.url];
                    if (modalPage) {
                      useModalStore.getState().openPage(modalPage);
                      return;
                    }

                    // Altri URL (mail, CV) restano un link vero e proprio.
                    if (choice.url) {
                      window.location.href = choice.url;
                      return;
                    }

                    // Se il bottone ha un prossimo nodo (es. Start over -> greeting), cambia nodo
                    if (choice.next) {
                      choose(choice.next);
                    }
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {/* Social Icons visibili solo quando il testo ha finito di scrivere ed è attivo il flag */}
          {!isTyping && node.meta?.showSocials && (
            <div className="landing-social" style={{ marginTop: '20px' }}>
              <a
                href="https://www.linkedin.com/in/emilia-cristina-duculet-3d-artist"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="pill-btn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.artstation.com/dec_emilia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Artstation"
                className="pill-btn"
              >
                <FaArtstation />
              </a>
              <a
                href="https://wa.me/393337720156"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="pill-btn"
              >
                <FaWhatsapp />
              </a>
              <a href="mailto:duculetemilia@gmail.com" aria-label="Email" className="pill-btn">
                <HiOutlineMail />
              </a>
            </div>
          )}
        </div>
      )}

      {hasStarted && (
        <div className="c-emi_controls">
          {history.length > 0 && (
            <button
              type="button"
              className="c-emi_iconBtn"
              aria-label="Go back"
              onClick={(e) => {
                e.stopPropagation();
                goBack();
              }}
            >
              ↺
            </button>
          )}
          <button
            type="button"
            className="c-emi_iconBtn"
            aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
    </div>
  );
}