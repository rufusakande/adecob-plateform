import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProtectedRoute.css';

// Composant pour les routes protégées
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  // Si nous avons déjà un utilisateur authentifié, afficher le contenu immédiatement
  if (user && isAuthenticated) {
    // Vérifier si l'utilisateur a les droits administrateur si requis
    if (requireAdmin && !isAdmin) {
      return (
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
          <p>Seuls les administrateurs peuvent accéder à cette section.</p>
        </div>
      );
    }

    // Vérifier le statut du compte
    /* if (user.statut !== 'actif') {
      return (
        <div className="account-inactive">
          <h2>Compte inactif</h2>
          <p>Votre compte est actuellement inactif ou suspendu.</p>
          <p>Veuillez contacter l'administrateur pour plus d'informations.</p>
        </div>
      );
    } */

    return children;
  }

  // Afficher le loader uniquement si on est en train de charger ET qu'on n'a pas encore d'utilisateur
  if (loading && !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  return <Navigate to="/login" state={{ from: location }} replace />;
}

// Composant spécifique pour les routes administrateur
function AdminRoute({ children }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
}

// Composant pour les routes publiques (utilisateur non connecté)
function PublicRoute({ children, restricted = false }) {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  
  // Si on a un utilisateur authentifié et la route est restreinte
  if (user && isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export { ProtectedRoute, AdminRoute, PublicRoute };