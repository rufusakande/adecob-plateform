import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../Layouts/Layout";
import axios from "axios";
import '../styles/register.css';

function Register() {
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    confirmPassword: "",
    departement_id: "",
    commune_id: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // États pour les données de localisation
  const [departements, setDepartements] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [filteredCommunes, setFilteredCommunes] = useState([]);

  // États pour l'interface
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation et chargement des données de localisation
  useEffect(() => {
    setTimeout(() => setAnimationComplete(true), 500);
    loadLocations();
  }, []);

  // Filtrer les communes selon le département sélectionné
  useEffect(() => {
    if (formData.departement_id) {
      const filtered = communes.filter(
        commune => commune.departement_id === parseInt(formData.departement_id)
      );
      setFilteredCommunes(filtered);
      // Réinitialiser la commune si elle n'est plus valide
      if (formData.commune_id) {
        const isValidCommune = filtered.some(
          commune => commune.id === parseInt(formData.commune_id)
        );
        if (!isValidCommune) {
          setFormData(prev => ({ ...prev, commune_id: "" }));
        }
      }
    } else {
      setFilteredCommunes([]);
      setFormData(prev => ({ ...prev, commune_id: "" }));
    }
  }, [formData.departement_id, communes]);

  // ❌ SUPPRIMÉ : Ce useEffect était le problème !
  // useEffect(() => {
  //   if (error) clearError();
  //   if (Object.keys(errors).length > 0) {
  //     setErrors({});
  //   }
  // }, [formData, error, clearError]);

  // Charger les départements et communes
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

  // Gérer les changements dans les champs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'email' ? value.trim() : value // Nettoyer automatiquement l'email
    }));

    // Nettoyer l'erreur spécifique pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Nettoyer aussi l'erreur générale
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

  // Validation côté client améliorée
  const validateForm = () => {
    const newErrors = {};

    // Validation des champs requis
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    } else if (formData.prenom.trim().length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du mot de passe
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = "Le mot de passe est requis";
    } else if (formData.mot_de_passe.length < 8) {
      newErrors.mot_de_passe = "Le mot de passe doit contenir au moins 8 caractères";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(formData.mot_de_passe)) {
        newErrors.mot_de_passe = "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial";
      }
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.mot_de_passe !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Validation du téléphone (optionnel)
    if (formData.telephone && formData.telephone.length < 8) {
      newErrors.telephone = "Le numéro de téléphone doit contenir au moins 8 caractères";
    }

    // Validation des sélections
    if (!formData.departement_id) {
      newErrors.departement_id = "Le département est requis";
    }

    if (!formData.commune_id) {
      newErrors.commune_id = "La commune est requise";
    }

    return newErrors;
  };

  // Gérer la soumission du formulaire
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Nettoyer les erreurs précédentes
    if (error) clearError();
    setSuccessMessage("");
    setErrors({});

    // Validation côté client
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API (sans confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      // Nettoyer les espaces et convertir les IDs en nombres
      registrationData.nom = registrationData.nom.trim();
      registrationData.prenom = registrationData.prenom.trim();
      registrationData.email = registrationData.email.trim();
      registrationData.departement_id = parseInt(registrationData.departement_id);
      registrationData.commune_id = parseInt(registrationData.commune_id);

      const result = await register(registrationData);
      
      if (result.success) {
        setSuccessMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Inscription réussie ! Connectez-vous avec vos identifiants." 
            }
          });
        }, 2000);
      }
    } catch (error) {
      // Gérer les erreurs spécifiques du backend
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('email existe déjà') || errorMessage.includes('email already exists')) {
        setErrors({ email: 'Un compte avec cet email existe déjà' });
      } else if (errorMessage.includes('téléphone existe déjà') || errorMessage.includes('telephone already exists')) {
        setErrors({ telephone: 'Ce numéro de téléphone est déjà utilisé' });
      } else if (errorMessage.includes('email invalide') || errorMessage.includes('invalid email')) {
        setErrors({ email: 'Format d\'email invalide' });
      } else if (errorMessage.includes('mot de passe') || errorMessage.includes('password')) {
        setErrors({ mot_de_passe: 'Le mot de passe ne respecte pas les critères requis' });
      } else if (errorMessage.includes('département') || errorMessage.includes('department')) {
        setErrors({ departement_id: 'Département invalide' });
      } else if (errorMessage.includes('commune')) {
        setErrors({ commune_id: 'Commune invalide' });
      } else if (errorMessage.includes('réseau') || errorMessage.includes('serveur') || errorMessage.includes('network')) {
        setErrors({ 
          general: 'Problème de connexion. Veuillez réessayer dans quelques instants.' 
        });
      } else {
        setErrors({ general: error.message || 'Une erreur inattendue s\'est produite.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basculer l'affichage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Vérifier si le formulaire est valide
  const isFormValid = formData.nom.trim() && 
                     formData.prenom.trim() && 
                     formData.email.trim() && 
                     formData.mot_de_passe && 
                     formData.confirmPassword && 
                     formData.departement_id && 
                     formData.commune_id;

  return (
    <Layout>
      <main className={`main-content ${animationComplete ? 'animate' : ''}`}>
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <h1 className="title">Rejoignez ADECOB</h1>
              <p className="subtitle">Créez votre compte pour accéder à la plateforme</p>
            </div>

            {/* Messages d'erreur généraux */}
            {(error || errors.general) && (
              <div className="alert alert-error">
                <div className="alert-icon">⚠</div>
                <div className="alert-content">
                  <strong>Erreur</strong>
                  <p>{error || errors.general}</p>
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

            <form className="register-form" onSubmit={handleRegister} noValidate>
              {/* Nom et Prénom */}
              <div className="form-row">
                <div className="form-group">
                  <div className="input-icon user"></div>
                  <input 
                    type="text" 
                    name="nom"
                    placeholder="Nom *" 
                    value={formData.nom}
                    onChange={handleInputChange}
                    className={errors.nom ? 'error' : ''}
                    required 
                    autoComplete="family-name"
                    aria-invalid={errors.nom ? 'true' : 'false'}
                    aria-describedby={errors.nom ? 'nom-error' : undefined}
                  />
                  {errors.nom && (
                    <div className="error-message" id="nom-error" role="alert">
                      <span className="error-icon">⚠</span>
                      {errors.nom}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-icon user"></div>
                  <input 
                    type="text" 
                    name="prenom"
                    placeholder="Prénom *" 
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className={errors.prenom ? 'error' : ''}
                    required 
                    autoComplete="given-name"
                    aria-invalid={errors.prenom ? 'true' : 'false'}
                    aria-describedby={errors.prenom ? 'prenom-error' : undefined}
                  />
                  {errors.prenom && (
                    <div className="error-message" id="prenom-error" role="alert">
                      <span className="error-icon">⚠</span>
                      {errors.prenom}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <div className="input-icon email"></div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Adresse email *" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  required 
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <div className="error-message" id="email-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Téléphone */}
              <div className="form-group">
                <div className="input-icon phone"></div>
                <input 
                  type="tel" 
                  name="telephone"
                  placeholder="Numéro de téléphone (optionnel)" 
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className={errors.telephone ? 'error' : ''}
                  autoComplete="tel"
                  aria-invalid={errors.telephone ? 'true' : 'false'}
                  aria-describedby={errors.telephone ? 'telephone-error' : undefined}
                />
                {errors.telephone && (
                  <div className="error-message" id="telephone-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.telephone}
                  </div>
                )}
              </div>

              {/* Département et Commune */}
              <div className="form-row">
                <div className="form-group">
                  <div className="input-icon location"></div>
                  <select 
                    name="departement_id"
                    value={formData.departement_id}
                    onChange={handleInputChange}
                    className={errors.departement_id ? 'error' : ''}
                    required
                    aria-invalid={errors.departement_id ? 'true' : 'false'}
                    aria-describedby={errors.departement_id ? 'departement-error' : undefined}
                  >
                    <option value="">Sélectionner un département *</option>
                    {departements.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </select>
                  {errors.departement_id && (
                    <div className="error-message" id="departement-error" role="alert">
                      <span className="error-icon">⚠</span>
                      {errors.departement_id}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-icon location"></div>
                  <select 
                    name="commune_id"
                    value={formData.commune_id}
                    onChange={handleInputChange}
                    className={errors.commune_id ? 'error' : ''}
                    disabled={!formData.departement_id}
                    required
                    aria-invalid={errors.commune_id ? 'true' : 'false'}
                    aria-describedby={errors.commune_id ? 'commune-error' : undefined}
                  >
                    <option value="">Sélectionner une commune *</option>
                    {filteredCommunes.map(commune => (
                      <option key={commune.id} value={commune.id}>
                        {commune.nom}
                      </option>
                    ))}
                  </select>
                  {errors.commune_id && (
                    <div className="error-message" id="commune-error" role="alert">
                      <span className="error-icon">⚠</span>
                      {errors.commune_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Mots de passe */}
              <div className="form-group">
                <div className="input-icon password"></div>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="mot_de_passe"
                    placeholder="Mot de passe *" 
                    value={formData.mot_de_passe}
                    onChange={handleInputChange}
                    className={errors.mot_de_passe ? 'error' : ''}
                    required 
                    autoComplete="new-password"
                    aria-invalid={errors.mot_de_passe ? 'true' : 'false'}
                    aria-describedby={errors.mot_de_passe ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.mot_de_passe && (
                  <div className="error-message" id="password-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.mot_de_passe}
                  </div>
                )}
              </div>

              <div className="form-group">
                <div className="input-icon password"></div>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe *" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    required 
                    autoComplete="new-password"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message" id="confirm-password-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-block ${!isFormValid ? 'btn-disabled' : ''}`}
                disabled={isSubmitting || loading || !isFormValid}
              >
                {isSubmitting || loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Inscription en cours...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>

            <div className="register-footer">
              <p>Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
            </div>
          </div>

          <div className="register-graphic">
            <div className="graphic-element circle-1"></div>
            <div className="graphic-element circle-2"></div>
            <div className="graphic-element square"></div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Register;