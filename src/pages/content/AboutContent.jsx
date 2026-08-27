import { useEffect, useRef, useState } from 'react';
import '../AboutPage.css';

const roles = ['3D Artist', 'Graphic Designer', 'Scenographer', 'Web Designer'];

// Definiamo le due frasi della carriera specificando quale ha il colore verde (la seconda usa career-stat--secondary)
const careerPhrases = [
  { text: '20+ Years', span: 'of Professional Experience', isSecondary: false },
  { text: '10+ Years', span: 'in Design & Digital Creative Work', isSecondary: true }
];

const milestones = [
  {
    number: '01',
    role: 'SCENOGRAPHY',
    heading: 'Physical Spaces & Visual Storytelling',
    period: 'Early Career · Since 2016',
    description:
      'My creative journey began with scenography, developing spaces, environments and visual concepts with a strong focus on atmosphere, composition and storytelling.',
  },
  {
    number: '02',
    role: 'GRAPHIC DESIGN',
    heading: 'Visual Communication',
    period: 'Freelance',
    description:
      'Moving from physical spaces to visual communication, I developed a multidisciplinary approach to branding, advertising, editorial and digital design.',
  },
  {
    number: '03',
    role: '3D ART',
    heading: 'From 2D to 3D',
    period: 'Digital → Physical',
    description:
      'The transition into 3D brought together my experience in design, composition and spatial thinking with digital modeling, sculpting and visualization.',
  },
  {
    number: '04',
    role: 'INTERACTIVE / WEB',
    heading: 'Designing Digital Experiences',
    period: 'Current Focus',
    description:
      'Today, I combine design and 3D with web technologies to create interactive experiences where visual storytelling, motion and technology work together.',
  },
];

const useRoleCycle = () => {
  const [text, setText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const full = roles[roleIndex];
    let i = 0;
    let deleting = false;
    const tick = () => {
      if (!deleting) {
        i += 1;
        setText(full.slice(0, i));
        if (i === full.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        i -= 1;
        setText(full.slice(0, i));
        if (i === 0) {
          setRoleIndex((r) => (r + 1) % roles.length);
          return;
        }
      }
      setTimeout(tick, deleting ? 35 : 60);
    };
    const t = setTimeout(tick, 60);
    return () => clearTimeout(t);
  }, [roleIndex]);

  return text;
};

// Hook per alternare le frasi con fade/slide verticale
const useCareerCycle = (count) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % count);
        setFade(true); // Fade in
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, [count]);

  return { current: careerPhrases[currentIndex], fade };
};

const useRevealOnScroll = (count) => {
  const refs = useRef([]);
  const [visible, setVisible] = useState(() => new Array(count).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.idx);
            setVisible((v) => {
              const next = [...v];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.25 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return { refs, visible };
};

const AboutContent = () => {
  const roleText = useRoleCycle();
  const { current: career, fade } = useCareerCycle(careerPhrases.length);
  const { refs, visible } = useRevealOnScroll(milestones.length);

  return (
    <>
      <h1 className="page-title">
        About <span>Me</span>
      </h1>
      <p className="about-role">
        {roleText}
        <span className="about-cursor">|</span>
      </p>
      <p className="about-bio">
        Hi there! My name is Emilia. I'm a multidisciplinary graphic designer
        and 3D artist. I combine visual design, 3D and spatial thinking to
        create visual identities, digital experiences and physical assets.
      </p>

      <br />

      <h1 className="page-title">
        My <span>Career</span>
      </h1>

      {/* Blocco carriera rotante con ripristino dei colori originali */}
      <div className="career-stat-container">
        <p
          className={`career-stat career-stat--rotating ${
            career.isSecondary ? 'career-stat--secondary' : ''
          } ${fade ? 'fade-in' : 'fade-out'}`}
        >
          {career.text} <span>{career.span}</span>
        </p>
      </div>

      <div className="career-timeline-list">
        {milestones.map((m, index) => (
          <div
            className={`career-timeline-item${
              visible[index] ? ' career-timeline-item--in' : ''
            }`}
            key={m.role}
            data-idx={index}
            ref={(el) => (refs.current[index] = el)}
          >
            <div className="career-timeline-dot" />
            <div className="career-timeline-content">
              <div className="career-item-head">
                <div>
                  <span className="career-item-number">{m.number}</span>
                  <h4>{m.heading}</h4>
                  <h5>{m.period}</h5>
                </div>
                <h3>{m.role}</h3>
              </div>
              <p>{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AboutContent;