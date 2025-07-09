import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../Layouts/Layout";
import { AuthContext } from "../context/AuthContext";
import '../styles/register.css'; // Reusing some styles

function AddInfrastructure() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    start: "",
    end: "",
    date_enquete: "",
    nom_enqueteur: "",
    numero_enquete: "",
    commune: "", // Will store the name of the commune
    village_quartier: "",
    secteur_domaine: "",
    type_infrastructure: "",
    nom_infrastructure: "",
    annee_realisation: "",
    bailleur: "",
    type_materiaux: "",
    etat_fonctionnement: "",
    niveau_degradation: "",
    mode_gestion: "",
    precise: "",
    defectuosites_relevees: "",
    mesures_proposees: "",
    observation_generale: "",
    rehabilitation: false,
    localisation: "", // Assuming this is a text field for general description
    latitude: "",
    longitude: "",
    altitude: "",
    precision_gps: "",
  });

  // States for location data
  const [departements, setDepartements] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [filteredCommunes, setFilteredCommunes] = useState([]);
  const [selectedDepartement, setSelectedDepartement] = useState(""); // To hold selected department ID

  // UI States
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Allowed ENUM values (should ideally come from backend or shared config)
  const etatFonctionnementOptions = ["Bon", "Moyen", "Mauvais", "Hors service", "Non fonctionnel"];
  const niveauDegradationOptions = ["Aucun", "Faible", "Moyen", "Élevé", "Très élevé"];

  useEffect(() => {
    setTimeout(() => setAnimationComplete(true), 500);
    loadLocations();
  }, []);

  // Load departments and communes
  const loadLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/locations`);
      if (response.data.success) {
        setDepartements(response.data.data.departements || []);
        setCommunes(response.data.data.communes || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
      setErrors({ general: 'Erreur lors du chargement des données de localisation' });
    }
  };

  // Filter communes based on selected department
  useEffect(() => {
    if (selectedDepartement) {
      const filtered = communes.filter(
        commune => commune.departement_id === parseInt(selectedDepartement)
      );
      setFilteredCommunes(filtered);
      // Reset commune if selected department changes
      setFormData(prev => ({ ...prev, commune: "" }));
    } else {
      setFilteredCommunes([]);
      setFormData(prev => ({ ...prev, commune: "" }));
    }
  }, [selectedDepartement, communes]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    // Clear general error on any input change
     if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

   const handleDepartementChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartement(departmentId);
    // Clear commune error when department changes
     if (errors.commune) {
      setErrors(prev => ({
        ...prev,
        commune: undefined
      }));
    }
  };

  // Basic client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields (example, adjust based on your needs)
    if (!formData.commune) newErrors.commune = "La commune est requise";
    if (!formData.type_infrastructure) newErrors.type_infrastructure = "Le type d'infrastructure est requis";
    if (!formData.nom_infrastructure) newErrors.nom_infrastructure = "Le nom de l'infrastructure est requis";
    if (!formData.date_enquete) newErrors.date_enquete = "La date d'enquête est requise";
    if (!formData.nom_enqueteur) newErrors.nom_enqueteur = "Le nom de l'enquêteur est requis";

    // Optional fields with format validation
    if (formData.annee_realisation && (isNaN(formData.annee_realisation) || formData.annee_realisation < 1900 || formData.annee_realisation > new Date().getFullYear())) {
        newErrors.annee_realisation = "Année de réalisation invalide";
    }

     if (formData.latitude && isNaN(formData.latitude)) newErrors.latitude = "Latitude invalide";
     if (formData.longitude && isNaN(formData.longitude)) newErrors.longitude = "Longitude invalide";
     if (formData.altitude && isNaN(formData.altitude)) newErrors.altitude = "Altitude invalide";
     if (formData.precision_gps && (isNaN(formData.precision_gps) || formData.precision_gps < 0)) newErrors.precision_gps = "Précision GPS invalide";

    // Validate ENUMs if values are mandatory
    if (formData.etat_fonctionnement && !etatFonctionnementOptions.includes(formData.etat_fonctionnement)) {
         newErrors.etat_fonctionnement = "Valeur invalide pour l'état de fonctionnement";
    }
     if (formData.niveau_degradation && !niveauDegradationOptions.includes(formData.niveau_degradation)) {
         newErrors.niveau_degradation = "Valeur invalide pour le niveau de dégradation";
    }

    // Add more validations as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClearForm = () => {
    setFormData({
       start: "",
        end: "",
        date_enquete: "",
        nom_enqueteur: "",
        numero_enquete: "",
        commune: "",
        village_quartier: "",
        secteur_domaine: "",
        type_infrastructure: "",
        nom_infrastructure: "",
        annee_realisation: "",
        bailleur: "",
        type_materiaux: "",
        etat_fonctionnement: "",
        niveau_degradation: "",
        mode_gestion: "",
        precise: "",
        defectuosites_relevees: "",
        mesures_proposees: "",
        observation_generale: "",
        rehabilitation: false,
        localisation: "",
        latitude: "",
        longitude: "",
        altitude: "",
        precision_gps: "",
    });
    setSelectedDepartement("");
    setErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrors({}); // Clear previous errors before submitting

    try {
        // Prepare data for backend, ensuring correct types for numbers/booleans
         const dataToSend = {
            ...formData,
            annee_realisation: formData.annee_realisation ? parseInt(formData.annee_realisation) : null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            altitude: formData.altitude ? parseFloat(formData.altitude) : null,
            precision_gps: formData.precision_gps ? parseFloat(formData.precision_gps) : null,
             // Ensure boolean is sent correctly
            rehabilitation: Boolean(formData.rehabilitation)
         };


      const response = await axios.post(`${API_URL}/data/infrastructure`, dataToSend);

      if (response.data.success) {
        setSuccessMessage("Infrastructure ajoutée avec succès ✅");
        handleClearForm(); // Clear form after successful submission
         // Optional: Redirect after a delay or show a confirmation modal
         // setTimeout(() => navigate('/dashboard'), 2000);
      } else {
         // Handle backend validation errors or specific messages
        setErrors({ general: response.data.message || "Une erreur est survenue lors de l'ajout." });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'infrastructure:", error);
       const backendErrors = error.response?.data?.errors;
       if(backendErrors && Array.isArray(backendErrors)) {
           const newErrors = {};
           backendErrors.forEach(err => {
               if(err.path) {
                   newErrors[err.path] = err.msg;
               } else {
                   newErrors.general = err.msg;
               }
           });
            // Handle data access error specifically
            if(error.response?.status === 403 && error.response?.data?.message) {
                 newErrors.general = error.response.data.message;
            }
           setErrors(newErrors);
       } else {
           setErrors({ general: error.response?.data?.message || error.message || "Erreur serveur inattendue." });
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
      // Simple check if required fields have values
      return formData.commune &&
             formData.type_infrastructure &&
             formData.nom_infrastructure &&
             formData.date_enquete &&
             formData.nom_enqueteur;
  };


  return (
    <Layout>
      <main className={`main-content ${animationComplete ? 'animate' : ''}`}>
        <div className="register-container"> {/* Reusing container class */}
          <div className="register-card"> {/* Reusing card class */}
            <div className="register-header">
              <h1 className="title">Ajouter une nouvelle infrastructure</h1>
              <p className="subtitle">Saisissez les détails de l'infrastructure manuellement</p>
            </div>

            {/* Messages d'erreur généraux */}
            {errors.general && (
              <div className="alert alert-error">
                <div className="alert-icon">⚠</div>
                <div className="alert-content">
                  <strong>Erreur</strong>
                  <p>{errors.general}</p>
                </div>
              </div>
            )}

             {/* Message de succès */}
            {successMessage && (
              <div className="alert alert-success">
                <div className="alert-icon">✓</div>
                <div className="alert-content">
                  <strong>Succès !</strong>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}


            <form className="register-form" onSubmit={handleSubmit} noValidate> {/* Reusing form class */}

              {/* Informations d'enquête */}
              <div className="form-section-title">Informations d'enquête</div>
              <div className="form-row">
                 <div className="form-group">
                    <label htmlFor="date_enquete">Date de l'enquête *</label>
                    <input
                        type="date"
                        id="date_enquete"
                        name="date_enquete"
                        value={formData.date_enquete}
                        onChange={handleInputChange}
                        className={errors.date_enquete ? 'error' : ''}
                        required
                         aria-invalid={errors.date_enquete ? 'true' : 'false'}
                        aria-describedby={errors.date_enquete ? 'date_enquete-error' : undefined}
                    />
                     {errors.date_enquete && (<div className="error-message" id="date_enquete-error" role="alert"><span className="error-icon">⚠</span>{errors.date_enquete}</div>)}
                 </div>
                  <div className="form-group">
                    <label htmlFor="nom_enqueteur">Nom de l'enquêteur *</label>
                    <input
                        type="text"
                        id="nom_enqueteur"
                        name="nom_enqueteur"
                        placeholder="Nom de l'enquêteur"
                        value={formData.nom_enqueteur}
                        onChange={handleInputChange}
                        className={errors.nom_enqueteur ? 'error' : ''}
                        required
                        aria-invalid={errors.nom_enqueteur ? 'true' : 'false'}
                        aria-describedby={errors.nom_enqueteur ? 'nom_enqueteur-error' : undefined}
                    />
                     {errors.nom_enqueteur && (<div className="error-message" id="nom_enqueteur-error" role="alert"><span className="error-icon">⚠</span>{errors.nom_enqueteur}</div>)}
                 </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                    <label htmlFor="numero_enquete">Numéro d'enquête</label>
                     <input
                        type="text"
                        id="numero_enquete"
                        name="numero_enquete"
                        placeholder="Numéro d'enquête"
                        value={formData.numero_enquete}
                        onChange={handleInputChange}
                         className={errors.numero_enquete ? 'error' : ''}
                         aria-invalid={errors.numero_enquete ? 'true' : 'false'}
                        aria-describedby={errors.numero_enquete ? 'numero_enquete-error' : undefined}
                    />
                      {errors.numero_enquete && (<div className="error-message" id="numero_enquete-error" role="alert"><span className="error-icon">⚠</span>{errors.numero_enquete}</div>)}
                 </div>
                 {/* Start/End (assuming text fields for timing) */}
                 <div className="form-group">
                    <label htmlFor="start">Début de l'enquête</label>
                    <input
                        type="text"
                        id="start"
                        name="start"
                        placeholder="Début (ex: HH:mm)"
                        value={formData.start}
                        onChange={handleInputChange}
                         className={errors.start ? 'error' : ''}
                         aria-invalid={errors.start ? 'true' : 'false'}
                        aria-describedby={errors.start ? 'start-error' : undefined}
                    />
                     {errors.start && (<div className="error-message" id="start-error" role="alert"><span className="error-icon">⚠</span>{errors.start}</div>)}
                 </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                    <label htmlFor="end">Fin de l'enquête</label>
                    <input
                        type="text"
                        id="end"
                        name="end"
                        placeholder="Fin (ex: HH:mm)"
                        value={formData.end}
                        onChange={handleInputChange}
                         className={errors.end ? 'error' : ''}
                         aria-invalid={errors.end ? 'true' : 'false'}
                        aria-describedby={errors.end ? 'end-error' : undefined}
                    />
                     {errors.end && (<div className="error-message" id="end-error" role="alert"><span className="error-icon">⚠</span>{errors.end}</div>)}
                 </div>
                 {/* Empty group for alignment */}
                 <div className="form-group"></div>
              </div>


              {/* Localisation Administrative */}
              <div className="form-section-title">Localisation Administrative</div>
               <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departement_id">Département *</label>
                  <select
                    id="departement_id"
                    name="departement_id"
                    value={selectedDepartement}
                    onChange={handleDepartementChange}
                     className={errors.departement_id ? 'error' : ''}
                    required
                     aria-invalid={errors.departement_id ? 'true' : 'false'}
                    aria-describedby={errors.departement_id ? 'departement_id-error' : undefined}
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </select>
                   {errors.departement_id && (<div className="error-message" id="departement_id-error" role="alert"><span className="error-icon">⚠</span>{errors.departement_id}</div>)}
                </div>

                <div className="form-group">
                   <label htmlFor="commune">Commune *</label>
                  <select
                    id="commune"
                    name="commune" // Store commune name in formData.commune
                    value={formData.commune}
                    onChange={handleInputChange}
                    className={errors.commune ? 'error' : ''}
                    disabled={!selectedDepartement}
                    required
                     aria-invalid={errors.commune ? 'true' : 'false'}
                    aria-describedby={errors.commune ? 'commune-error' : undefined}
                  >
                    <option value="">Sélectionner une commune</option>
                    {filteredCommunes.map(commune => (
                      <option key={commune.id} value={commune.nom}> {/* Use commune.nom */}
                        {commune.nom}
                      </option>
                    ))}
                  </select>
                   {errors.commune && (<div className="error-message" id="commune-error" role="alert"><span className="error-icon">⚠</span>{errors.commune}</div>)}
                </div>
              </div>

               {/* Village/Quartier, Hameau, Secteur/Domaine */}
               <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="village_quartier">Village/Quartier</label>
                     <input
                        type="text"
                        id="village_quartier"
                        name="village_quartier"
                        placeholder="Village ou Quartier"
                        value={formData.village_quartier}
                        onChange={handleInputChange}
                         className={errors.village_quartier ? 'error' : ''}
                         aria-invalid={errors.village_quartier ? 'true' : 'false'}
                        aria-describedby={errors.village_quartier ? 'village_quartier-error' : undefined}
                    />
                     {errors.village_quartier && (<div className="error-message" id="village_quartier-error" role="alert"><span className="error-icon">⚠</span>{errors.village_quartier}</div>)}
                 </div>
                  <div className="form-group">
                    <label htmlFor="hameau">Hameau</label>
                     <input
                        type="text"
                        id="hameau"
                        name="hameau"
                        placeholder="Hameau"
                        value={formData.hameau}
                        onChange={handleInputChange}
                         className={errors.hameau ? 'error' : ''}
                         aria-invalid={errors.hameau ? 'true' : 'false'}
                        aria-describedby={errors.hameau ? 'hameau-error' : undefined}
                    />
                     {errors.hameau && (<div className="error-message" id="hameau-error" role="alert"><span className="error-icon">⚠</span>{errors.hameau}</div>)}
                 </div>
               </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="secteur_domaine">Secteur/Domaine</label>
                     <input
                        type="text"
                        id="secteur_domaine"
                        name="secteur_domaine"
                        placeholder="Secteur ou Domaine"
                        value={formData.secteur_domaine}
                        onChange={handleInputChange}
                         className={errors.secteur_domaine ? 'error' : ''}
                         aria-invalid={errors.secteur_domaine ? 'true' : 'false'}
                        aria-describedby={errors.secteur_domaine ? 'secteur_domaine-error' : undefined}
                    />
                     {errors.secteur_domaine && (<div className="error-message" id="secteur_domaine-error" role="alert"><span className="error-icon">⚠</span>{errors.secteur_domaine}</div>)}
                 </div>
                 {/* Empty group for alignment */}
                 <div className="form-group"></div>
                </div>


               {/* Informations sur l'infrastructure */}
                <div className="form-section-title">Informations sur l'infrastructure</div>
                <div className="form-row">
                   <div className="form-group">
                    <label htmlFor="type_infrastructure">Type d'infrastructure *</label>
                     <input
                        type="text"
                        id="type_infrastructure"
                        name="type_infrastructure"
                        placeholder="Type d'infrastructure"
                        value={formData.type_infrastructure}
                        onChange={handleInputChange}
                         className={errors.type_infrastructure ? 'error' : ''}
                         required
                         aria-invalid={errors.type_infrastructure ? 'true' : 'false'}
                        aria-describedby={errors.type_infrastructure ? 'type_infrastructure-error' : undefined}
                    />
                     {errors.type_infrastructure && (<div className="error-message" id="type_infrastructure-error" role="alert"><span className="error-icon">⚠</span>{errors.type_infrastructure}</div>)}
                 </div>
                  <div className="form-group">
                    <label htmlFor="nom_infrastructure">Nom de l'infrastructure *</label>
                     <input
                        type="text"
                        id="nom_infrastructure"
                        name="nom_infrastructure"
                        placeholder="Nom de l'infrastructure"
                        value={formData.nom_infrastructure}
                        onChange={handleInputChange}
                         className={errors.nom_infrastructure ? 'error' : ''}
                         required
                         aria-invalid={errors.nom_infrastructure ? 'true' : 'false'}
                        aria-describedby={errors.nom_infrastructure ? 'nom_infrastructure-error' : undefined}
                    />
                      {errors.nom_infrastructure && (<div className="error-message" id="nom_infrastructure-error" role="alert"><span className="error-icon">⚠</span>{errors.nom_infrastructure}</div>)}
                 </div>
                </div>
                 <div className="form-row">
                   <div className="form-group">
                    <label htmlFor="annee_realisation">Année de réalisation</label>
                     <input
                        type="number"
                        id="annee_realisation"
                        name="annee_realisation"
                        placeholder="Année (ex: 2023)"
                        value={formData.annee_realisation}
                        onChange={handleInputChange}
                         className={errors.annee_realisation ? 'error' : ''}
                         aria-invalid={errors.annee_realisation ? 'true' : 'false'}
                        aria-describedby={errors.annee_realisation ? 'annee_realisation-error' : undefined}
                    />
                     {errors.annee_realisation && (<div className="error-message" id="annee_realisation-error" role="alert"><span className="error-icon">⚠</span>{errors.annee_realisation}</div>)}
                 </div>
                   <div className="form-group">
                    <label htmlFor="bailleur">Bailleur</label>
                     <input
                        type="text"
                        id="bailleur"
                        name="bailleur"
                        placeholder="Bailleur"
                        value={formData.bailleur}
                        onChange={handleInputChange}
                         className={errors.bailleur ? 'error' : ''}
                         aria-invalid={errors.bailleur ? 'true' : 'false'}
                        aria-describedby={errors.bailleur ? 'bailleur-error' : undefined}
                    />
                      {errors.bailleur && (<div className="error-message" id="bailleur-error" role="alert"><span className="error-icon">⚠</span>{errors.bailleur}</div>)}
                 </div>
                </div>
                 <div className="form-row">
                    <div className="form-group full-width">
                         <label htmlFor="type_materiaux">Type de matériaux</label>
                         <textarea
                            id="type_materiaux"
                            name="type_materiaux"
                            placeholder="Description des matériaux"
                            value={formData.type_materiaux}
                            onChange={handleInputChange}
                             className={errors.type_materiaux ? 'error' : ''}
                             aria-invalid={errors.type_materiaux ? 'true' : 'false'}
                            aria-describedby={errors.type_materiaux ? 'type_materiaux-error' : undefined}
                        />
                         {errors.type_materiaux && (<div className="error-message" id="type_materiaux-error" role="alert"><span className="error-icon">⚠</span>{errors.type_materiaux}</div>)}
                    </div>
                 </div>


                {/* État et gestion */}
                 <div className="form-section-title">État et gestion</div>
                 <div className="form-row">
                     <div className="form-group">
                        <label htmlFor="etat_fonctionnement">État de fonctionnement</label>
                        <select
                            id="etat_fonctionnement"
                            name="etat_fonctionnement"
                            value={formData.etat_fonctionnement}
                            onChange={handleInputChange}
                             className={errors.etat_fonctionnement ? 'error' : ''}
                             aria-invalid={errors.etat_fonctionnement ? 'true' : 'false'}
                            aria-describedby={errors.etat_fonctionnement ? 'etat_fonctionnement-error' : undefined}
                        >
                            <option value="">Sélectionner l'état</option>
                            {etatFonctionnementOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                         {errors.etat_fonctionnement && (<div className="error-message" id="etat_fonctionnement-error" role="alert"><span className="error-icon">⚠</span>{errors.etat_fonctionnement}</div>)}
                     </div>
                     <div className="form-group">
                        <label htmlFor="niveau_degradation">Niveau de dégradation</label>
                         <select
                            id="niveau_degradation"
                            name="niveau_degradation"
                            value={formData.niveau_degradation}
                            onChange={handleInputChange}
                             className={errors.niveau_degradation ? 'error' : ''}
                             aria-invalid={errors.niveau_degradation ? 'true' : 'false'}
                            aria-describedby={errors.niveau_degradation ? 'niveau_degradation-error' : undefined}
                        >
                            <option value="">Sélectionner le niveau</option>
                             {niveauDegradationOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                          {errors.niveau_degradation && (<div className="error-message" id="niveau_degradation-error" role="alert"><span className="error-icon">⚠</span>{errors.niveau_degradation}</div>)}
                     </div>
                 </div>
                 <div className="form-row">
                    <div className="form-group">
                         <label htmlFor="mode_gestion">Mode de gestion</label>
                         <input
                            type="text"
                            id="mode_gestion"
                            name="mode_gestion"
                            placeholder="Mode de gestion"
                            value={formData.mode_gestion}
                            onChange={handleInputChange}
                             className={errors.mode_gestion ? 'error' : ''}
                             aria-invalid={errors.mode_gestion ? 'true' : 'false'}
                            aria-describedby={errors.mode_gestion ? 'mode_gestion-error' : undefined}
                        />
                         {errors.mode_gestion && (<div className="error-message" id="mode_gestion-error" role="alert"><span className="error-icon">⚠</span>{errors.mode_gestion}</div>)}
                    </div>
                    <div className="form-group">
                         <label htmlFor="precise">Préciser (Mode de gestion)</label>
                         <input
                            type="text"
                            id="precise"
                            name="precise"
                            placeholder="Préciser le mode"
                            value={formData.precise}
                            onChange={handleInputChange}
                             className={errors.precise ? 'error' : ''}
                             aria-invalid={errors.precise ? 'true' : 'false'}
                            aria-describedby={errors.precise ? 'precise-error' : undefined}
                        />
                         {errors.precise && (<div className="error-message" id="precise-error" role="alert"><span className="error-icon">⚠</span>{errors.precise}</div>)}
                    </div>
                 </div>
                 <div className="form-row">
                     <div className="form-group full-width">
                         <label htmlFor="rehabilitation">Besoin de réhabilitation</label>
                         <div className="checkbox-group">
                             <input
                                 type="checkbox"
                                 id="rehabilitation"
                                 name="rehabilitation"
                                 checked={formData.rehabilitation}
                                 onChange={handleInputChange}
                             />
                             <label htmlFor="rehabilitation">Oui, nécessite une réhabilitation</label>
                         </div>
                          {errors.rehabilitation && (<div className="error-message" id="rehabilitation-error" role="alert"><span className="error-icon">⚠</span>{errors.rehabilitation}</div>)}
                     </div>
                 </div>


                {/* Observations et recommandations */}
                 <div className="form-section-title">Observations et Recommandations</div>
                  <div className="form-row">
                     <div className="form-group full-width">
                        <label htmlFor="defectuosites_relevees">Défectuosités relevées</label>
                         <textarea
                            id="defectuosites_relevees"
                            name="defectuosites_relevees"
                            placeholder="Décrire les problèmes rencontrés"
                            value={formData.defectuosites_relevees}
                            onChange={handleInputChange}
                             className={errors.defectuosites_relevees ? 'error' : ''}
                             aria-invalid={errors.defectuosites_relevees ? 'true' : 'false'}
                            aria-describedby={errors.defectuosites_relevees ? 'defectuosites_relevees-error' : undefined}
                        />
                         {errors.defectuosites_relevees && (<div className="error-message" id="defectuosites_relevees-error" role="alert"><span className="error-icon">⚠</span>{errors.defectuosites_relevees}</div>)}
                    </div>
                  </div>
                   <div className="form-row">
                    <div className="form-group full-width">
                         <label htmlFor="mesures_proposees">Mesures proposées</label>
                         <textarea
                            id="mesures_proposees"
                            name="mesures_proposees"
                            placeholder="Suggérer des mesures correctives"
                            value={formData.mesures_proposees}
                            onChange={handleInputChange}
                             className={errors.mesures_proposees ? 'error' : ''}
                             aria-invalid={errors.mesures_proposees ? 'true' : 'false'}
                            aria-describedby={errors.mesures_proposees ? 'mesures_proposees-error' : undefined}
                        />
                         {errors.mesures_proposees && (<div className="error-message" id="mesures_proposees-error" role="alert"><span className="error-icon">⚠</span>{errors.mesures_proposees}</div>)}
                    </div>
                   </div>
                    <div className="form-row">
                     <div className="form-group full-width">
                         <label htmlFor="observation_generale">Observation générale</label>
                         <textarea
                            id="observation_generale"
                            name="observation_generale"
                            placeholder="Observations générales"
                            value={formData.observation_generale}
                            onChange={handleInputChange}
                             className={errors.observation_generale ? 'error' : ''}
                             aria-invalid={errors.observation_generale ? 'true' : 'false'}
                            aria-describedby={errors.observation_generale ? 'observation_generale-error' : undefined}
                        />
                         {errors.observation_generale && (<div className="error-message" id="observation_generale-error" role="alert"><span className="error-icon">⚠</span>{errors.observation_generale}</div>)}
                    </div>
                 </div>

                 {/* Géolocalisation */}
                 <div className="form-section-title">Géolocalisation</div>
                 <div className="form-row">
                    <div className="form-group">
                         <label htmlFor="latitude">Latitude</label>
                         <input
                            type="number"
                            step="any"
                            id="latitude"
                            name="latitude"
                            placeholder="Ex: 6.35"
                            value={formData.latitude}
                            onChange={handleInputChange}
                             className={errors.latitude ? 'error' : ''}
                             aria-invalid={errors.latitude ? 'true' : 'false'}
                            aria-describedby={errors.latitude ? 'latitude-error' : undefined}
                        />
                         {errors.latitude && (<div className="error-message" id="latitude-error" role="alert"><span className="error-icon">⚠</span>{errors.latitude}</div>)}
                    </div>
                    <div className="form-group">
                         <label htmlFor="longitude">Longitude</label>
                         <input
                            type="number"
                            step="any"
                            id="longitude"
                            name="longitude"
                            placeholder="Ex: 2.42"
                            value={formData.longitude}
                            onChange={handleInputChange}
                             className={errors.longitude ? 'error' : ''}
                             aria-invalid={errors.longitude ? 'true' : 'false'}
                            aria-describedby={errors.longitude ? 'longitude-error' : undefined}
                        />
                         {errors.longitude && (<div