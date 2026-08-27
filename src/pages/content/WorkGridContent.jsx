import { Link } from 'react-router-dom';
import { workProjects } from '../workData';
import { publicUrl } from '../../utils/publicUrl';
import '../WorkPage.css';

// Piccolo tilt 3D che segue il mouse sulla card, spento su schermi
// touch (dove non ha senso): la peculiarità di questa pagina rispetto
// alle altre.
const handleTilt = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${
    -y * 10
  }deg) translateY(-6px)`;
};
const resetTilt = (e) => {
  e.currentTarget.style.transform = '';
};

const CardInner = ({ project, index }) => (
  <>
    <div className="work-card-image">
      <img src={publicUrl(project.image)} alt={project.alt} />
    </div>
    <div className="work-card-info">
      <span className="work-card-number">
        {index < 9 ? `0${index + 1}` : index + 1}
      </span>
      <div>
        <h3>{project.title}</h3>
        <p>{project.category}</p>
      </div>
    </div>
  </>
);

/**
 * `onSelect(project)` è opzionale:
 * - passato (popup) -> le card diventano bottoni che aprono il
 *   dettaglio dentro lo stesso popup, senza cambiare URL/pagina.
 * - assente (pagina /work) -> le card sono normali Link di
 *   react-router verso /work/:id.
 */
const WorkGridContent = ({ onSelect }) => {
  return (
    <>
      <h1 className="page-title">
        My <span>Work</span>
      </h1>
      <div className="work-grid">
        {workProjects.map((project, index) =>
          onSelect ? (
            <button
              type="button"
              className="work-card work-card--button"
              key={project.id}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
              onClick={() => onSelect(project)}
            >
              <CardInner project={project} index={index} />
            </button>
          ) : (
            <Link
              to={`/work/${project.id}`}
              className="work-card"
              key={project.id}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <CardInner project={project} index={index} />
            </Link>
          )
        )}
      </div>
    </>
  );
};

export default WorkGridContent;
