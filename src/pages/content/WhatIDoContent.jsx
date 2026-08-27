import { lazy, Suspense, useState } from 'react';
import '../WhatIDoPage.css';
import '../TechStackBalls.css';

// Le sfere fisiche (Three.js + Rapier) pesano parecchio: caricate in
// lazy così le altre pagine/il popup restano leggeri e veloci.
const TechStackBalls = lazy(() => import('../TechStackBalls'));

const services = [
  {
    title: '3D ART',
    subtitle: '3D Modeling & Production',
    description:
      'Creating detailed 3D assets, characters and environments, from digital sculpting to 3D printing and physical production.',
    tags: [
      'Character Modeling',
      'Sculpting',
      'Retopo & Texturing',
      '3D Printing · CNC',
      'Game Engines · Real-Time 3D',
    ],
  },
  {
    title: 'DESIGN',
    subtitle: 'Multidisciplinary Visual Design',
    description:
      'Specializing in Branding, Visual Communication and 3D-enhanced digital experiences.',
    tags: ['Branding', 'Visual Identity', 'Advertising', 'Motion Design', 'Digital Design'],
  },
  {
    title: 'WEB',
    subtitle: 'Digital & Interactive Experiences',
    description:
      'Designing engaging digital experiences where visual design, interaction and real-time 3D come together.',
    tags: [
      'Web Design',
      'UI/UX Design',
      'Interactive Design',
      '3D Web',
      'Responsive Design',
    ],
  },
];

const WhatIDoContent = () => {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <>
      <h1 className="page-title">
        What <span>I Do</span>
      </h1>

      <div className="what-grid">
        {services.map((service, index) => {
          const isActive = activeCard === index;
          return (
            <div
              className={`card-container${isActive ? ' card-container--active' : ''}`}
              key={service.title}
              onClick={() => setActiveCard(isActive ? null : index)}
            >
              <div className="card">
                {/* LATO POSTERIORE (BACK) */}
                <div className="back">
                  <div className="blue"></div>
                  <div className="text">
                    <span className="card-badge">Service 0{index + 1}</span>
                    <h3>{service.title}</h3>
                    <span className="what-card-hint">
                      {isActive ? '● selected' : '○ hover / tap'}
                    </span>
                  </div>
                </div>

                {/* LATO ANTERIORE (FRONT) */}
                <div className="front">
                  <div className="blue"></div>
                  <div className="front-content">
                    <div>
                      <h3>{service.title}</h3>
                      <h4>{service.subtitle}</h4>
                      <p>{service.description}</p>
                    </div>
                    <div>
                      <h5>Skillset & tools</h5>
                      <div className="what-tags-row">
                        {service.tags.map((tag) => (
                          <span className="what-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <br /><br /><br /><br />
      <h1 className="page-title">
        My <span>Stack</span>
      </h1>
      <p className="stack-hint">
        Muovi il mouse (o il dito, su schermo touch) sopra le sfere.
      </p>
      <Suspense
        fallback={<div className="tech-balls-fallback">Loading stack…</div>}
      >
        <TechStackBalls />
      </Suspense>
    </>
  );
};

export default WhatIDoContent;
