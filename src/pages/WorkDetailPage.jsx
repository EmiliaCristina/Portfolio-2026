import { useParams, Navigate } from 'react-router-dom';
import PageTopbar from './PageTopbar';
import WorkDetailContent from './content/WorkDetailContent';
import { workProjects } from './workData';
import './pages.css';

const WorkDetailPage = () => {
  const { id } = useParams();
  const project = workProjects.find((p) => String(p.id) === id);

  // Se l'id nell'URL non corrisponde a nessun progetto, torna alla lista.
  if (!project) {
    return <Navigate to="/work" replace />;
  }

  return (
    <div className="page-shell">
      <PageTopbar backTo="/work" backLabel="Torna a My Work" />
      <WorkDetailContent project={project} />
    </div>
  );
};

export default WorkDetailPage;
