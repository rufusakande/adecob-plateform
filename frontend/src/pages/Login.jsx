import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Layout from "../Layouts/Layout";
import '../styles/register.css';

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Message de succès depuis l'inscription
  const successMessage = location.state?.message;

  useEffect(() => {
    // Animation
    setTimeout(() => setAnimationComplete(true), 500);
    
    // Rediriger si déjà connecté
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Nettoyer les erreurs quand on change les champs
  useEffect(() => {
    if (error) clearError();
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData.email, formData.mot_de_passe, error, clearError]);

  // Gérer les changements dans les champs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim() // Nettoyer automatiquement les espaces
    }));

    // Nettoyer l'erreur spécifique pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validation côté client améliorée
  const validateForm = () => {
    const newErrors = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation mot de passe
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = "Le mot de passe est requis";
    } else if (formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = "Le mot de passe doit contenir au moins 6 caractères";
    }

    return newErrors;
  };

  // Gérer la soumission du formulaire
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Nettoyer les erreurs précédentes
    if (error) clearError();
    setErrors({});

    // Validation côté client
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.mot_de_passe);
      
      if (result.success) {
        // Redirection selon le rôle
        const redirectTo = location.state?.from?.pathname || 
                          (result.user.role === 'administrateur' ? '/admin/dashboard' : '/dashboard');
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      // Gérer les erreurs spécifiques du backend
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('email') && errorMessage.includes('mot de passe')) {
        setErrors({ 
          general: 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.' 
        });
      } else if (errorMessage.includes('inactif') || errorMessage.includes('suspendu')) {
        setErrors({ 
          general: 'Votre compte est inactif ou suspendu. Contactez l\'administrateur.' 
        });
      } else if (errorMessage.includes('email')) {
        setErrors({ email: 'Aucun compte trouvé avec cet email.' });
      } else if (errorMessage.includes('mot de passe')) {
        setErrors({ mot_de_passe: 'Mot de passe incorrect.' });
      } else if (errorMessage.includes('réseau') || errorMessage.includes('serveur')) {
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

  // Vérifier si le formulaire est valide
  const isFormValid = formData.email.trim() && formData.mot_de_passe;

  return (
    <Layout>
      <main className={`main-content ${animationComplete ? 'animate' : ''}`}>
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <h1 className="title">Bienvenue sur ADECOB</h1>
              <p className="subtitle">Connectez-vous pour accéder à votre espace</p>
            </div>

            {/* Message de succès depuis l'inscription */}
            {successMessage && (
              <div className="alert alert-success">
                <div className="alert-icon">✓</div>
                <div className="alert-content">
                  <strong>Succès !</strong>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

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

            <form className="register-form" onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <div className="input-icon email"></div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Votre email" 
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

              <div className="form-group">
                <div className="input-icon password"></div>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="mot_de_passe"
                    placeholder="Votre mot de passe" 
                    value={formData.mot_de_passe}
                    onChange={handleInputChange}
                    className={errors.mot_de_passe ? 'error' : ''}
                    required 
                    autoComplete="current-password"
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

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-block ${!isFormValid ? 'btn-disabled' : ''}`}
                disabled={isSubmitting || loading || !isFormValid}
              >
                {isSubmitting || loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="register-footer">
              <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
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

export default Login;