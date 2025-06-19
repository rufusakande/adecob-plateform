import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import * as XLSX from "xlsx";
import '../styles/UploadForm.css';

function UploadForm({ onUploadSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  // Colonnes attendues pour la validation
  const expectedColumns = [
    'Nom de l\'enquêteur',
    'Numéro d\'enquête', 
    'Commune',
    'Village/Quartier',
    'Type d\'infrastructure',
    'Nom de l\'infrastructure',
    'État de fonctionnement',
    'Latitude',
    'Longitude'
  ];

  // Fonction pour récupérer le token depuis localStorage
  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  const validateFile = (selectedFile) => {
    // Vérifier l'extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      throw new Error("Format de fichier non supporté. Utilisez uniquement .xlsx ou .xls");
    }

    // Vérifier la taille (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      throw new Error("Le fichier est trop volumineux. Taille maximale : 10MB");
    }

    return true;
  };

  const validateExcelData = (data) => {
    if (!data || data.length === 0) {
      throw new Error("Le fichier Excel est vide");
    }

    // Vérifier les colonnes requises
    const fileColumns = Object.keys(data[0] || {});
    const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.warn("Colonnes manquantes:", missingColumns);
      // On ne bloque pas, mais on avertit
    }

    // Vérifier qu'il y a au moins quelques colonnes importantes
    const criticalColumns = ['Commune', 'Type d\'infrastructure', 'Nom de l\'infrastructure'];
    const hasCriticalColumns = criticalColumns.some(col => fileColumns.includes(col));
    
    if (!hasCriticalColumns) {
      throw new Error("Le fichier ne contient pas les colonnes critiques requises");
    }

    return true;
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    
    try {
      validateFile(selectedFile);
      
      setFile(selectedFile);
      setFilePreview({
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: selectedFile.type
      });
      setMessage("");
      setUploadResult(null);

      // Prévisualiser le contenu
      const reader = new FileReader();
      reader.readAsBinaryString(selectedFile);
      reader.onload = (e) => {
        try {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);
          
          validateExcelData(data);
          
          setFileData({
            totalRows: data.length,
            columns: Object.keys(data[0] || {}),
            preview: data.slice(0, 3),
            sheetName: sheetName
          });
          
          setMessage(`✅ Fichier valide : ${data.length} ligne(s) détectée(s)`);
          setMessageType("success");
          
        } catch (error) {
          console.error("Erreur lors de la lecture du fichier:", error);
          setMessage(error.message);
          setMessageType("error");
          setFile(null);
          setFilePreview(null);
          setFileData(null);
        }
      };

      reader.onerror = () => {
        setMessage("Erreur lors de la lecture du fichier");
        setMessageType("error"); 
        setFile(null);
        setFilePreview(null);
      };

    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Veuillez sélectionner un fichier Excel");
      setMessageType("error");
      return;
    }

    if (!fileData || fileData.totalRows === 0) {
      setMessage("Le fichier sélectionné ne contient aucune donnée valide");
      setMessageType("error");
      return;
    }

    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      setMessage("Vous devez être connecté pour importer des données. Veuillez vous reconnecter.");
      setMessageType("error");
      return;
    }

    // Vérifier la présence du token
    const accessToken = getAccessToken();
    if (!accessToken) {
      setMessage("Token d'authentification manquant. Veuillez vous reconnecter.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage("Importation en cours...");
    setMessageType("info");
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/data/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si l'erreur est liée à l'authentification, suggérer une reconnexion
        if (response.status === 401) {
          setMessage("Session expirée. Veuillez vous reconnecter.");
          setMessageType("error");
          return;
        }
        
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadResult({
        importId: result.importId,
        totalImported: result.totalImported,
        totalErrors: result.errors?.length || 0,
        errors: result.errors || []
      });

      if (result.errors && result.errors.length > 0) {
        setMessage(`⚠️ Importation terminée avec ${result.errors.length} erreur(s). ${result.totalImported} ligne(s) importée(s).`);
        setMessageType("warning");
      } else {
        setMessage(`✅ Importation réussie ! ${result.totalImported} ligne(s) importée(s).`);
        setMessageType("success");
      }

      // Notifier le parent du succès après un délai
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      
      let errorMessage = "Erreur lors de l'importation des données";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setMessageType("error");
      setUploadResult(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFilePreview(null);
    setFileData(null);
    setMessage("");
    setMessageType("");
    setUploadResult(null);
    setUploadProgress(0);
    
    // Reset input file
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Afficher un message de chargement si l'authentification est en cours
  if (loading) {
    return (
      <div className="upload-form">
        <div className="loading-auth">
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Afficher un message si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="upload-form">
        <div className="auth-required">
          <h3>🔒 Authentification requise</h3>
          <p>Vous devez être connecté pour accéder à cette fonctionnalité.</p>
          <p>Veuillez vous connecter pour continuer.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="upload-form-container">
      <div className="upload-form">
        <div className="upload-header">
          <h3>📊 Importer des données d'infrastructure</h3>
          <p className="upload-description">
            Importez vos données Excel contenant les informations sur les infrastructures de votre commune.
          </p>
          {user && (
            <p className="user-info">
              Connecté en tant que : <strong>{user.nom || user.email}</strong>
            </p>
          )}
        </div>
        
        <div 
          className={`dropzone ${dragActive ? 'active' : ''} ${filePreview ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id="file-upload" 
            accept=".xlsx,.xls" 
            onChange={handleInputChange}
            className="file-input" 
            disabled={uploading}
          />
          
          {filePreview ? (
            <div className="file-preview">
              <div className="file-icon">📄</div>
              <div className="file-info">
                <p className="file-name">{filePreview.name}</p>
                <p className="file-details">{filePreview.size}</p>
                {fileData && (
                  <p className="file-stats">
                    {fileData.totalRows} ligne(s) • {fileData.columns.length} colonne(s)
                  </p>
                )}
                <button 
                  className="remove-file" 
                  onClick={resetForm}
                  disabled={uploading}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ) : (
            <label htmlFor="file-upload" className="upload-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p><strong>Glissez votre fichier Excel ici</strong></p>
                <span>ou</span>
                <button type="button" className="browse-btn" disabled={uploading}>
                  Parcourir les fichiers
                </button>
              </div>
              <div className="upload-hints">
                <p>• Formats acceptés : .xlsx, .xls</p>
                <p>• Taille maximale : 10 MB</p>
              </div>
            </label>
          )}
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Importation en cours... {uploadProgress}%</p>
          </div>
        )}
        
        {message && (
          <div className={`message ${messageType}`}>
            <span className="message-text">{message}</span>
          </div>
        )}

        {uploadResult && (
          <div className="upload-result">
            <h4>📋 Résumé de l'importation</h4>
            <div className="result-stats">
              <div className="stat-item success">
                <span className="stat-number">{uploadResult.totalImported}</span>
                <span className="stat-label">Lignes importées</span>
              </div>
              {uploadResult.totalErrors > 0 && (
                <div className="stat-item error">
                  <span className="stat-number">{uploadResult.totalErrors}</span>
                  <span className="stat-label">Erreurs</span>
                </div>
              )}
            </div>
            
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <details className="error-details">
                <summary>Voir les erreurs ({uploadResult.errors.length})</summary>
                <div className="error-list">
                  {uploadResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="error-item">
                      <strong>Ligne {error.ligne}:</strong> {error.erreur}
                    </div>
                  ))}
                  {uploadResult.errors.length > 5 && (
                    <p className="more-errors">
                      ... et {uploadResult.errors.length - 5} autre(s) erreur(s)
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button 
            className={`btn-upload ${file && fileData && !uploading && isAuthenticated ? 'btn-primary' : 'btn-disabled'}`}
            onClick={handleUpload} 
            disabled={uploading || !file || !fileData || !isAuthenticated}
          >
            {uploading ? (
              <>
                <span className="loading-spinner"></span>
                Importation...
              </>
            ) : (
              <>
                <span className="upload-icon">⬆️</span>
                Importer les données
              </>
            )}
          </button>
          
          {file && !uploading && (
            <button 
              className="btn-secondary" 
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadForm;