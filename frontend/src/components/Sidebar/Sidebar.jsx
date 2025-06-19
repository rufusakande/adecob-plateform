// Sidebar.jsx
import { Link } from "react-router-dom";
import './Sidebar.css';

function Sidebar({ isOpen, isCollapsed, toggleCollapse }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" onClick={toggleCollapse}>
        <h3>{isCollapsed ? '' : 'Menu'}</h3>
        <button className="collapse-btn" aria-label="Collapse Sidebar">
          <span className="chevron"></span>
        </button>
      </div>
      <ul className="sidebar-menu">
        <li className="menu-item">
          <Link to="/dashboard" title={isCollapsed ? "Dashboard" : ""}>
            <i className="icon dashboard-icon"></i>
            <span className={isCollapsed ? "hidden" : ""}>Dashboard</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/import" title={isCollapsed ? "Importation" : ""}>
            <i className="icon import-icon"></i>
            <span className={isCollapsed ? "hidden" : ""}>Importation</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/visualisation" title={isCollapsed ? "Visualisation" : ""}>
            <i className="icon visual-icon"></i>
            <span className={isCollapsed ? "hidden" : ""}>Visualisation</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/traitement" title={isCollapsed ? "Traitement" : ""}>
            <i className="icon process-icon"></i>
            <span className={isCollapsed ? "hidden" : ""}>Traitement</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;