import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/InfrastructureDetails.css';

// Modal de confirmation de suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, infrastructureName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirmer la suppression</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div className="warning-icon">⚠️</div>
          <p>Êtes-vous sûr de vouloir supprimer cette infrastructure ?</p>
          <p><strong>{infrastructureName}</strong></p>
          <p className="warning-text">Cette action est irréversible.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal pour marquer comme traité
const ProcessModal = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [observations, setObservations] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(observations);
    setObservations('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Marquer comme traité</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="observations">Observations internes (optionnel)</label>
              <textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Ajoutez vos observations sur le traitement de cette infrastructure..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-success" disabled={isProcessing}>
              {isProcessing ? 'Traitement...' : 'Marquer comme traité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function InfrastructureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Utilisation du contexte d'authentification
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  const [infrastructure, setInfrastructure] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  
  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fonction pour récupérer le token depuis localStorage
  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  useEffect(() => {
    // Ne pas faire l'appel API si l'authentification est en cours ou si l'utilisateur n'est pas connecté
    if (!loading && isAuthenticated) {
      fetchInfrastructureDetails();
    }
  }, [id, loading, isAuthenticated]);

  const fetchInfrastructureDetails = async () => {
    try {
      setLoadingData(true);
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        toast.error("Token d'authentification manquant. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_URL}/data/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );

      setInfrastructure(response.data);
      setEditedData(response.data);
      setLoadingData(false);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem("accessToken");
        navigate('/login');
        return;
      }
      if (err.response?.status === 404) {
        setError("Infrastructure non trouvée");
        toast.error("Infrastructure non trouvée");
      } else {
        setError("Erreur lors du chargement des détails");
        toast.error("Erreur lors du chargement des détails");
      }
      setLoadingData(false);
      console.error(err);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...infrastructure });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedData({ ...infrastructure });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const accessToken = getAccessToken();

      if (!accessToken) {
        toast.error("Token d'authentification manquant. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${API_URL}/data/${id}`,
        editedData,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );

      setInfrastructure(response.data.data);
      setEditedData(response.data.data);
      setEditing(false);
      setSaving(false);
      
      // Notification de succès
      toast.success("Infrastructure mise à jour avec succès !");
    } catch (err) {
      setSaving(false);
      console.error(err);
      
      if (err.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      
      toast.error("Erreur lors de la sauvegarde : " + (err.response?.data?.message || err.message));
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarkAsProcessed = async (observations) => {
    try {
      setIsProcessing(true);
      const accessToken = getAccessToken();

      if (!accessToken) {
        toast.error("Token d'authentification manquant. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }

      await axios.patch(
        `${API_URL}/data/${id}/process`,
        { observations_internes: observations || '' },
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );

      // Recharger les données
      fetchInfrastructureDetails();
      setShowProcessModal(false);
      toast.success("Infrastructure marquée comme traitée !");
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      
      toast.error("Erreur lors du traitement : " + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        toast.error("Token d'authentification manquant. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      
      await axios.delete(
        `${API_URL}/data/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );

      setShowDeleteModal(false);
      toast.success("Infrastructure supprimée avec succès !");
      navigate(-1); // Retourner à la page précédente
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate('/login');
        return;
      }
      
      toast.error("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'nouveau': 'status-nouveau',
      'en_cours': 'status-en-cours',
      'traite': 'status-traite',
      'valide': 'status-valide'
    };
    
    const statusLabels = {
      'nouveau': 'Nouveau',
      'en_cours': 'En cours',
      'traite': 'Traité',
      'valide': 'Validé'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const renderField = (label, field, type = 'text', options = null) => {
    const value = editing ? editedData[field] : infrastructure[field];
    
    if (editing) {
      if (type === 'select' && options) {
        return (
          <div className="form-group">
            <label>{label}</label>
            <select
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="form-control"
            >
              <option value="">Sélectionner...</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      } else if (type === 'textarea') {
        return (
          <div className="form-group">
            <label>{label}</label>
            <textarea
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="form-control"
              rows="3"
            />
          </div>
        );
      } else if (type === 'number') {
        return (
          <div className="form-group">
            <label>{label}</label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="form-control"
              step="0.000001"
            />
          </div>
        );
      } else {
        return (
          <div className="form-group">
            <label>{label}</label>
            <input
              type={type}
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="form-control"
            />
          </div>
        );
      }
    } else {
      return (
        <div className="detail-item">
          <span className="detail-label">{label}:</span>
          <span className="detail-value">{value || '-'}</span>
        </div>
      );
    }
  };

  // Affichage pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="details-container">
        <div className="loading-auth">
          <div className="spinner"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Affichage si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="details-container">
        <div className="auth-required">
          <div className="error-icon">🔒</div>
          <h3>Authentification requise</h3>
          <p>Vous devez être connecté pour accéder à cette fonctionnalité.</p>
          <p>Veuillez vous connecter pour continuer.</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Affichage pendant le chargement des données
  if (loadingData) {
    return (
      <div className="details-container loading">
        <div className="spinner"></div>
        <p>Chargement des détails...</p>
        {user && (
          <p className="user-info">
            Connecté en tant que : <strong>{user.nom || user.email}</strong>
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-container error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Retour
        </button>
      </div>
    );
  }

  if (!infrastructure) {
    return (
      <div className="details-container error">
        <p>Infrastructure non trouvée</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Retour
        </button>
      </div>
    );
  }

  return (
    <>
      <div id="infrastructure-details">
        {/* ToastContainer remplace le Toaster de react-hot-toast */}
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />

        <div className="details-container">
            {/* En-tête */}
            <div className="details-header">
            <button onClick={() => navigate(-1)} className="btn btn-back">
                ← Retour
            </button>
            <h1>Infrastructure #{infrastructure.id}</h1>
            <div className="header-status">
                {getStatusBadge(infrastructure.statut_traitement)}
            </div>
            </div>

            {/* Informations utilisateur */}
            {user && (
            <div className="user-info-banner">
                Connecté en tant que : <strong>{user.nom || user.email}</strong>
            </div>
            )}

            {/* Actions */}
            <div className="details-actions">
            {!editing ? (
                <>
                <button onClick={handleEdit} className="btn btn-primary">
                    ✏️ Modifier
                </button>
                {infrastructure.statut_traitement === 'nouveau' && (
                    <button onClick={() => setShowProcessModal(true)} className="btn btn-success">
                    ✅ Marquer comme traité
                    </button>
                )}
                <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
                    🗑️ Supprimer
                </button>
                </>
            ) : (
                <>
                <button 
                    onClick={handleSave} 
                    className="btn btn-success"
                    disabled={saving}
                >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button onClick={handleCancel} className="btn btn-secondary">
                    ❌ Annuler
                </button>
                </>
            )}
            </div>

            {/* Contenu principal */}
            <div className="details-content">
            {/* Informations générales */}
            <div className="details-section">
                <h2>Informations générales</h2>
                <div className="details-grid">
                {renderField("Nom de l'infrastructure", "nom_infrastructure")}
                {renderField("Type d'infrastructure", "type_infrastructure")}
                {renderField("Commune", "commune")}
                {renderField("Village/Quartier", "village_quartier")}
                {renderField("Secteur/Domaine", "secteur_domaine")}
                </div>
            </div>

            {/* État et fonctionnement */}
            <div className="details-section">
                <h2>État et fonctionnement</h2>
                <div className="details-grid">
                {renderField("État de fonctionnement", "etat_fonctionnement", "select", 
                    ['Bon', 'Moyen', 'Mauvais', 'Hors service', 'Non fonctionnel'])}
                {renderField("Niveau de dégradation", "niveau_degradation", "select",
                    ['Aucun', 'Faible', 'Moyen', 'Élevé', 'Très élevé'])}
                {renderField("Mode de gestion", "mode_gestion")}
                {renderField("Année de réalisation", "annee_realisation", "number")}
                {renderField("Bailleur", "bailleur")}
                {renderField("Type de matériaux", "type_materiaux")}
                {renderField("Précision", "precise")}
                </div>
            </div>

            {/* Observations */}
            <div className="details-section">
                <h2>Observations et recommandations</h2>
                <div className="details-grid">
                {renderField("Défectuosités relevées", "defectuosites_relevees", "textarea")}
                {renderField("Mesures proposées", "mesures_proposees", "textarea")}
                {renderField("Observation générale", "observation_generale", "textarea")}
                {renderField("Observations internes", "observations_internes", "textarea")}
                </div>
            </div>

            {/* Géolocalisation */}
            <div className="details-section">
                <h2>Géolocalisation</h2>
                <div className="details-grid">
                {renderField("Latitude", "latitude", "number")}
                {renderField("Longitude", "longitude", "number")}
                {renderField("Altitude", "altitude", "number")}
                {renderField("Précision GPS", "precision_gps", "number")}
                </div>
            </div>

            {/* Métadonnées */}
            <div className="details-section">
                <h2>Informations système</h2>
                <div className="details-grid">
                <div className="detail-item">
                    <span className="detail-label">Source des données:</span>
                    <span className="detail-value">
                    {infrastructure.source_donnee === 'import' ? 'Import Excel' : 
                    infrastructure.source_donnee === 'saisie_manuelle' ? 'Saisie manuelle' : 
                    infrastructure.source_donnee || '-'}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Créé par:</span>
                    <span className="detail-value">
                    {infrastructure.createur_nom && infrastructure.createur_prenom 
                        ? `${infrastructure.createur_nom} ${infrastructure.createur_prenom}`
                        : '-'}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Date de création:</span>
                    <span className="detail-value">{formatDate(infrastructure.date_creation)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Traité par:</span>
                    <span className="detail-value">
                    {infrastructure.traiteur_nom && infrastructure.traiteur_prenom 
                        ? `${infrastructure.traiteur_nom} ${infrastructure.traiteur_prenom}`
                        : '-'}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Date de traitement:</span>
                    <span className="detail-value">{formatDate(infrastructure.date_traitement)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Dernière modification:</span>
                    <span className="detail-value">{formatDate(infrastructure.updated_at)}</span>
                </div>
                </div>
            </div>
            </div>

            {/* Modals */}
            <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            infrastructureName={infrastructure.nom_infrastructure || `Infrastructure #${infrastructure.id}`}
            />

            <ProcessModal
            isOpen={showProcessModal}
            onClose={() => setShowProcessModal(false)}
            onConfirm={handleMarkAsProcessed}
            isProcessing={isProcessing}
            />
        </div>
      </div>
    </>
  );
}

export default InfrastructureDetails;