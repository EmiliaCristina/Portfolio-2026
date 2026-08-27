import '../WorkDetailPage.css';

/**
 * `onBack` è la callback per tornare alla lista: nella pagina/route è
 * una navigate('/work'), nel popup è semplicemente uno stato locale.
 * `backLabel` cambia di conseguenza il testo del link.
 */
const WorkDetailContent = ({ project, onBack, backLabel = 'Torna a My Work' }) => {
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

      <div className="project-hero-image">
        <img
          src={project.detailImage ? project.detailImage : project.image}
          alt={project.alt}
        />
      </div>

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
