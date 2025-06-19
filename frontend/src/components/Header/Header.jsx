// Header.jsx - Version améliorée
import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import logoImg from '../../assets/images/logo.png';
import './Header.css';

function Header({ toggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Fermer le menu mobile lors du redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Vous pouvez ajouter ici une notification d'erreur
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <button 
          className={`menu-toggle ${isSidebarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="logo-container">
          <img src={logoImg} alt="ADECOB Logo" className="logo" />
          <h2>ADECOB</h2>
        </div>
      </div>
      
      <div className={`navbar-links ${mobileMenuOpen ? 'show' : ''}`}>
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`} 
          onClick={closeMobileMenu}
        >
          Accueil
        </Link>
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
              onClick={closeMobileMenu}
            >
              Tableau de bord
            </Link>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`nav-link ${isActive('/login') ? 'active' : ''}`} 
              onClick={closeMobileMenu}
            >
              Connexion
            </Link>
            <Link 
              to="/register" 
              className={`nav-link register-btn ${isActive('/register') ? 'active' : ''}`} 
              onClick={closeMobileMenu}
            >
              Inscription
            </Link>
          </>
        )}
      </div>
      
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu} 
        aria-label="Toggle Mobile Menu"
        aria-expanded={mobileMenuOpen}
      >
        <span className={mobileMenuOpen ? 'open' : ''}></span>
        <span className={mobileMenuOpen ? 'open' : ''}></span>
        <span className={mobileMenuOpen ? 'open' : ''}></span>
      </button>
      
      {mobileMenuOpen && (
        <div 
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'show' : ''}`} 
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}

export default Header;