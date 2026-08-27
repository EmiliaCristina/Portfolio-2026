import PageTopbar from './PageTopbar';
import WhatIDoContent from './content/WhatIDoContent';
import './pages.css';

const WhatIDoPage = () => {
  return (
    <div className="page-shell">
      <PageTopbar />
      <WhatIDoContent />
    </div>
  );
};

export default WhatIDoPage;
