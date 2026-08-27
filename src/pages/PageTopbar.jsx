import { Link } from 'react-router-dom';

/**
 * Barra superiore condivisa dalle pagine standalone (Work, What I Do,
 * Career): un link per tornare all'esperienza L.I.S.A. (home, "/") e il
 * nome/brand. `backTo` è opzionale, per pagine annidate come il
 * dettaglio di un progetto (torna alla lista Work invece che alla home).
 */
const PageTopbar = ({ backTo = '/', backLabel = "Torna a Emi" }) => {
  return (
    <div className="page-topbar">
      <Link to={backTo} className="page-back-link">
        <span aria-hidden="true">←</span>
        <span>{backLabel}</span>
      </Link>
      <span className="page-brand">DEC — Emilia Duculet</span>
    </div>
  );
};

export default PageTopbar;
