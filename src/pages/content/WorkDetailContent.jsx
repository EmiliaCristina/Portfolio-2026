import { lazy, Suspense } from 'react';
import '../WorkDetailPage.css';
import { publicUrl } from '../../utils/publicUrl';
import CharacterReel from '../CharacterReel';

// Caricato solo quando serve: i modelli 3D di Mycro non pesano sulle
// altre schede.
const MycroAtlas = lazy(() => import('../mycro/MycroAtlas'));
const ViraAtlas = lazy(() => import('../vira/ViraAtlas'));
const JungleGallery = lazy(() => import('../jungle/JungleGallery'));
const BrandBook = lazy(() => import('../brand/BrandBook'));
const AdShowcase = lazy(() => import('../ad/AdShowcase'));
const IpShowcase = lazy(() => import('../ip/IpShowcase'));

/**
 * `onBack` è la callback per tornare alla lista: nella pagina/route è
 * una navigate('/work'), nel popup è semplicemente uno stato locale.
 * `backLabel` cambia di conseguenza il testo del link.
 */
const WorkDetailContent = ({ project, onBack, backLabel = 'Back to Work' }) => {
  const formattedId = project.id < 10 ? `0${project.id}` : project.id;

  return (
    <>
      {onBack && (
        <button type="button" className="page-back-link work-detail-back" onClick={onBack}>
          <span aria-hidden="true">←</span>
          <span>{backLabel}</span>
        </button>
      )}

      <header className="project-header">
        <div className="project-meta">
          <span className="project-number">{formattedId}</span>
          <div>
            <h1>{project.title}</h1>
            <p className="project-category">{project.category}</p>
          </div>
        </div>
        <div className="project-tools-box">
          <h3>Tools & Features</h3>
          <p>{project.tools}</p>
        </div>
      </header>

      {project.atlas === 'mycro' ? (
        <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
          <MycroAtlas />
        </Suspense>
      ) : project.atlas === 'vira' ? (
        <>
          {project.reel && <CharacterReel {...project.reel} />}
          {project.reel && <p className="creel-deepdive">Deep dive · Vira Nyx</p>}
          <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
            <ViraAtlas />
          </Suspense>
        </>
      ) : project.atlas === 'brand' ? (
        <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
          <BrandBook />
        </Suspense>
      ) : project.atlas === 'ad' ? (
        <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
          <AdShowcase />
        </Suspense>
      ) : project.atlas === 'ip' ? (
        <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
          <IpShowcase />
        </Suspense>
      ) : project.atlas === 'jungle' ? (
        <Suspense fallback={<div className="ma-suspense" aria-hidden="true" />}>
          <JungleGallery />
        </Suspense>
      ) : (
        <div className="project-hero-image">
          <img
            src={publicUrl(project.detailImage ? project.detailImage : project.image)}
            alt={project.alt}
          />
        </div>
      )}

      <section className="project-content">
        <div className="content-grid">
          <div className="description-block">
            <h3>About the Project</h3>
            <p>{project.description}</p>

            <div className="project-facts">
              <div className="project-fact">
                <span>Role</span>
                <strong>{project.role}</strong>
              </div>
              <div className="project-fact">
                <span>Process</span>
                <strong>{project.process}</strong>
              </div>
              <div className="project-fact">
                <span>Output</span>
                <strong>{project.output}</strong>
              </div>
            </div>
          </div>
          <div className="specs-block">
            <h3>Project Specs</h3>
            <ul>
              <li>
                <span>Category</span>
                <strong>{project.category}</strong>
              </li>
              <li>
                <span>Tools Used</span>
                <strong>{project.tools}</strong>
              </li>
              <li>
                <span>Status</span>
                <strong>Completed</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default WorkDetailContent;
