import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadForm from "../components/UploadForm";
import DataTable from "../components/DataTable";
import Layout from "../Layouts/Layout";
import '../styles/dashboard.css';

function Dashboard() {
  const { user, loading, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalImports: 0,
    recentActivity: []
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Trigger animation after page load
    setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setError(null);

        // Vérifier que l'utilisateur est connecté
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        // Récupérer les statistiques si l'utilisateur est admin
        if (isAdmin) {
          try {
            const statsResponse = await axios.get('/auth/stats');
            if (statsResponse.data.success) {
              setStats(statsResponse.data.data);
            }
          } catch (statsError) {
            console.warn("Erreur lors de la récupération des statistiques:", statsError);
            // Ne pas bloquer le dashboard si les stats ne marchent pas
          }
        }

      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [refresh, isAuthenticated, isAdmin, navigate]);

  // Redirection si non authentifié
  if (loading || dashboardLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    navigate("/login");
    return null;
  }

  const handleUploadSuccess = () => {
    setRefresh(!refresh);
    setShowUploadModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'administrateur':
        return 'Administrateur';
      case 'membre':
        return 'Membre';
      default:
        return role;
    }
  };

  return (
    <Layout>
      <main className={`dashboard-content ${animationComplete ? 'animate' : ''}`}>
        {/* En-tête du dashboard */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Bonjour, <span className="user-name">{user.prenom} {user.nom}</span></h1>
            <div className="user-info">
              <p className="user-email">{user.email}</p>
              <div className="user-details">
                <span className="user-role">{getRoleDisplayName(user.role)} {" "}</span>
                <span className="user-location">
                  {user.commune?.nom} {user.departement?.nom}
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-primary upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              📤 Importer des données
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Informations utilisateur */}
        {/* <div className="user-profile-card">
          <h2>Informations du profil</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">Nom complet:</span>
              <span className="value">{user.prenom} {user.nom}</span>
            </div>
            <div className="profile-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="profile-item">
              <span className="label">Téléphone:</span>
              <span className="value">{user.telephone || 'Non renseigné'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Rôle:</span>
              <span className="value role-badge">{getRoleDisplayName(user.role)}</span>
            </div>
            <div className="profile-item">
              <span className="label">Département:</span>
              <span className="value">{user.departement?.nom} ({user.departement?.code})</span>
            </div>
            <div className="profile-item">
              <span className="label">Commune:</span>
              <span className="value">{user.commune?.nom} ({user.commune?.code})</span>
            </div>
            <div className="profile-item">
              <span className="label">Membre depuis:</span>
              <span className="value">{formatDate(user.date_inscription)}</span>
            </div>
            <div className="profile-item">
              <span className="label">Dernière connexion:</span>
              <span className="value">{formatDate(user.derniere_connexion)}</span>
            </div>
          </div>
        </div> */}

        {/* Statistiques pour les administrateurs */}
        {isAdmin && (
          <div className="stats-section">
            <h2>Statistiques de la plateforme</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon users">👥</div>
                <div className="stat-content">
                  <h3>Utilisateurs totaux</h3>
                  <p className="stat-number">{stats.totalUsers || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon active-users">✅</div>
                <div className="stat-content">
                  <h3>Utilisateurs actifs</h3>
                  <p className="stat-number">{stats.activeUsers || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon imports">📊</div>
                <div className="stat-content">
                  <h3>Fichiers importés</h3>
                  <p className="stat-number">{stats.totalImports || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        {/* <div className="quick-actions">
          <h2>Actions rapides</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => setShowUploadModal(true)}
            >
              <div className="action-icon">📤</div>
              <div className="action-content">
                <h3>Importer des données</h3>
                <p>Télécharger un fichier Excel</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => navigate('/profile')}
            >
              <div className="action-icon">👤</div>
              <div className="action-content">
                <h3>Modifier le profil</h3>
                <p>Mettre à jour vos informations</p>
              </div>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/data')}
            >
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>Gérer les données</h3>
                <p>Visualiser et traiter les données</p>
              </div>
            </button>

            {isAdmin && (
              <button 
                className="action-card admin-action"
                onClick={() => navigate('/admin')}
              >
                <div className="action-icon">⚙️</div>
                <div className="action-content">
                  <h3>Administration</h3>
                  <p>Gérer les utilisateurs et paramètres</p>
                </div>
              </button>
            )}
          </div>
        </div> */}

        {/* Section des données */}
        <div className="data-section">
          <h2>Vos données récentes</h2>
          <DataTable key={refresh} />
        </div>

        {/* Modal d'upload */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Importer des données</h2>
                <button className="close-modal" onClick={() => setShowUploadModal(false)}>
                  ×
                </button>
              </div>
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

export default Dashboard;