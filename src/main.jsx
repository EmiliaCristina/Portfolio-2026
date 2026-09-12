import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmiExperience from './EmiExperience';
import WorkPage from './pages/WorkPage';
import WorkDetailPage from './pages/WorkDetailPage';
import WhatIDoPage from './pages/WhatIDoPage';
import AboutPage from './pages/AboutPage';
import Navbar from './components/Navbar';


// HashRouter (URL del tipo /#/work) invece di BrowserRouter: funziona
// sempre, anche aprendo il link in una nuova scheda o in produzione su
// un hosting statico, senza bisogno di configurare rewrite/redirect
// lato server per le route "pulite".
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      {/* Navbar fissa, montata una sola volta sopra alle Routes: resta
          identica e sempre visibile sia sulla home (esperienza 3D) sia
          su tutte le pagine standalone, senza doverla ripetere ovunque. */}
      <Navbar />
      <Routes>
        <Route path="/" element={<EmiExperience />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:id" element={<WorkDetailPage />} />
        <Route path="/what-i-do" element={<WhatIDoPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* /career è confluita in /about (About Me + My Career unite):
            redirect di cortesia per eventuali link vecchi già in giro. */}
        <Route path="/career" element={<Navigate to="/about" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
