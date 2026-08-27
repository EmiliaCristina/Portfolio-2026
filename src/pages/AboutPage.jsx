import PageTopbar from './PageTopbar';
import AboutContent from './content/AboutContent';
import './pages.css';

const AboutPage = () => {
  return (
    <div className="page-shell">
      <PageTopbar />
      <AboutContent />
    </div>
  );
};

export default AboutPage;
