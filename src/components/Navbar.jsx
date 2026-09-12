import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaLinkedinIn, FaArtstation, FaWhatsapp } from 'react-icons/fa';
import { HiOutlineMail, HiMenu, HiX } from 'react-icons/hi';
import { publicUrl } from '../utils/publicUrl';
import { useDialogueStore } from '../DialogueEngine';
import './Navbar.css';

/**
 * Navbar fissa in alto, sempre visibile, presente su tutte le pagine
 * (montata una sola volta in main.jsx, sopra alle <Routes>). Usa
 * react-router <Link> per Work/About/Services così funziona in modo
 * identico sia sulla home (esperienza 3D) sia sulle pagine standalone,
 * senza dipendere dal popup in-page (useModalStore), che oggi vive solo
 * dentro EmiExperience.
 *
 * "Contact" non è un link ma un piccolo pannello a comparsa con gli
 * stessi contatti già usati nel pannello di dialogo (email, WhatsApp,
 * LinkedIn, ArtStation), per non dover creare una pagina/route dedicata.
 */
const NAV_LINKS = [
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/what-i-do' },
];

const CONTACT_LINKS = [
  {
    label: 'Email',
    href: 'mailto:duculetemilia@gmail.com',
    icon: <HiOutlineMail />,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/393337720156',
    icon: <FaWhatsapp />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/emilia-cristina-duculet-3d-artist',
    icon: <FaLinkedinIn />,
  },
  {
    label: 'Artstation',
    href: 'https://www.artstation.com/dec_emilia',
    icon: <FaArtstation />,
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef(null);
  const location = useLocation();
  const hasStarted = useDialogueStore((s) => s.hasStarted);

  // Sulla home la navbar resta nascosta finché l'utente non clicca la
  // prima scelta nella conversazione (per non rovinare l'ingresso in
  // scena del personaggio). Su tutte le altre pagine, dove non c'è
  // nessuna conversazione, è sempre visibile.
  const isVisible = location.pathname !== '/' || hasStarted;

  // Chiude il popover Contact se si clicca fuori.
  useEffect(() => {
    if (!contactOpen) return undefined;
    const onClick = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [contactOpen]);

  // Chiude entrambi i menu con Esc.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setContactOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={`emi-navbar${isVisible ? ' emi-navbar--visible' : ''}`}>
      <div className="emi-navbar-inner">
        <Link to="/" className="emi-navbar-brand" onClick={closeMobile}>
          Emilia Duculet
        </Link>

        {/* Link desktop, nascosti sotto la soglia mobile via CSS */}
        <nav className="emi-navbar-links" aria-label="Navigazione principale">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="emi-navbar-link">
              {link.label}
            </Link>
          ))}

          <div className="emi-navbar-contact" ref={contactRef}>
            <button
              type="button"
              className="emi-navbar-link emi-navbar-contact-btn"
              aria-haspopup="true"
              aria-expanded={contactOpen}
              onClick={() => setContactOpen((v) => !v)}
            >
              Contact
            </button>

            {contactOpen && (
              <div className="emi-navbar-contact-panel" role="menu">
                {CONTACT_LINKS.map((c) => (
                  
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="emi-navbar-contact-item"
                    role="menuitem"
                  >
                    <span className="emi-navbar-contact-icon">{c.icon}</span>
                    <span>{c.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          
            href={publicUrl('/cv-emilia.pdf')}
            download
            className="emi-navbar-cv"
          >
            CV
          </a>
        </nav>

        {/* Hamburger, visibile solo sotto la soglia mobile via CSS */}
        <button
          type="button"
          className="emi-navbar-burger"
          aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Pannello mobile a tendina */}
      {mobileOpen && (
        <div className="emi-navbar-mobile-panel">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="emi-navbar-mobile-link"
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}

          <div className="emi-navbar-mobile-contacts">
            {CONTACT_LINKS.map((c) => (
              
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={c.label}
                className="emi-navbar-mobile-icon"
              >
                {c.icon}
              </a>
            ))}
          </div>

          
            href={publicUrl('/cv-emilia.pdf')}
            download
            className="emi-navbar-cv emi-navbar-cv--mobile"
            onClick={closeMobile}
          >
            Download CV
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
