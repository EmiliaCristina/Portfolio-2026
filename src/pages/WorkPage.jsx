import PageTopbar from './PageTopbar';
import WorkGridContent from './content/WorkGridContent';
import './pages.css';

const WorkPage = () => {
  return (
    <div className="page-shell">
      <PageTopbar />
      <WorkGridContent />
    </div>
  );
};

export default WorkPage;
