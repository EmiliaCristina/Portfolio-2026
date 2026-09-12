import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaLinkedinIn, FaArtstation, FaWhatsapp } from 'react-icons/fa';
import { HiOutlineMail, HiMenu, HiX } from 'react-icons/hi';
import { publicUrl } from '../utils/publicUrl';
import { useDialogueStore } from '../DialogueEngine';
import './Navbar.css';

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

  const isVisible = location.pathname !== '/' || hasStarted;

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
  <img src={publicUrl('/images/DEC.png')} alt="Duculet Emilia Cristina" className="emi-navbar-logo" />
</Link>

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
                  <a key={c.label}
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

          <a href={publicUrl('/cv-emilia.pdf')} download className="emi-navbar-cv">
            CV
          </a>
        </nav>

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

      {mobileOpen && (
        <div className="emi-navbar-mobile-panel">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="emi-navbar-mobile-link" onClick={closeMobile}>
              {link.label}
            </Link>
          ))}

          <div className="emi-navbar-mobile-contacts">
            {CONTACT_LINKS.map((c) => (
              <a key={c.label}
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

          <a href={publicUrl('/cv-emilia.pdf')}
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
