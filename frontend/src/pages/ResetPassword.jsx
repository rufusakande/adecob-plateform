import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../Layouts/Layout';
import '../styles/register.css'; // You might want a separate CSS file for reset password

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { resetPassword, loading: authLoading, error: authError, clearError } = useContext(AuthContext);

  useEffect(() => {
    // Clear any previous auth errors on mount
    if (authError) {
      clearError();
    }
    // Maybe add a check here if token is present, though useParams handles this somewhat
    if (!token) {
      // Handle missing token - maybe redirect to forgot password or an error page
      setErrors({ general: "Token de réinitialisation manquant." });
    }
  }, [authError, clearError, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific field error on change
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
     // Clear general errors on change
    if (errors.general) {
         setErrors(prev => ({ ...prev, general: undefined }));
    }
     if (successMessage) {
         setSuccessMessage('');
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
    } else {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(formData.newPassword)) {
            newErrors.newPassword = "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial";
        }
    }


    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Confirmez le nouveau mot de passe';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Clear previous errors and success message
    if (authError) clearError();
    setErrors({});
    setSuccessMessage('');

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(token, formData.newPassword, formData.confirmNewPassword);

      if (result.success) {
        setSuccessMessage('Mot de passe réinitialisé avec succès ! Redirection vers la page de connexion...');
        setFormData({ newPassword: '', confirmNewPassword: '' }); // Clear form
        setTimeout(() => {
          navigate('/login', { state: { message: 'Votre mot de passe a été réinitialisé avec succès. Connectez-vous maintenant.' } });
        }, 3000); // Redirect after 3 seconds
      } else {
          // This part might not be reached if resetPassword throws on error
           setErrors({ general: result.message || 'Erreur lors de la réinitialisation du mot de passe.' });
      }
    } catch (error) {
      // Handle errors from AuthContext's resetPassword function
      const errorMessage = error.message || 'Une erreur inattendue s\'est produite.';
      setErrors({ general: errorMessage });
      console.error("Reset password failed:", error); // Log for debugging
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const isFormValid = formData.newPassword && formData.confirmNewPassword && formData.newPassword === formData.confirmNewPassword && Object.keys(validateForm()).length === 0;

  const isLoading = isSubmitting || authLoading;

  // If token is missing, just show error message and stop rendering form
  if (!token) {
      return (
          <Layout>
              <main className="main-content">
                   <div className="register-container"> {/* Reuse register styling */}
                        <div className="register-card">
                            <div className="register-header">
                                <h1 className="title">Réinitialisation de mot de passe</h1>
                            </div>
                             {errors.general && (
                                <div className="alert alert-error">
                                    <div className="alert-icon">⚠</div>
                                    <div className="alert-content">
                                        <strong>Erreur</strong>
                                        <p>{errors.general}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
              </main>
          </Layout>
      );
  }


  return (
    <Layout>
      <main className={`main-content ${true ? 'animate' : ''}`}> {/* Consider adding actual animation class */}
        <div className="register-container"> {/* Reuse register styling */}
          <div className="register-card">
            <div className="register-header">
              <h1 className="title">Réinitialisation de mot de passe</h1>
              <p className="subtitle">Entrez votre nouveau mot de passe</p>
            </div>

            {/* General Error Message */}
            {(authError || errors.general) && (
              <div className="alert alert-error">
                <div className="alert-icon">⚠</div>
                <div className="alert-content">
                  <strong>Erreur</strong>
                  <p>{authError || errors.general}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success">
                <div className="alert-icon">✓</div>
                <div className="alert-content">
                  <strong>Succès !</strong>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

            {isLoading && ( // Global loading indicator for submission or auth checks
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Chargement...</p>
                </div>
            )}


            <form className="register-form" onSubmit={handleResetPassword} noValidate>

              {/* New Password */}
              <div className="form-group">
                 <div className="input-icon password"></div>
                 <div className="password-input-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Nouveau mot de passe *"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={errors.newPassword ? 'error' : ''}
                    required
                    autoComplete="new-password"
                    aria-invalid={errors.newPassword ? 'true' : 'false'}
                    aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
                  />
                   <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleNewPasswordVisibility}
                        aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showNewPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                </div>
                {errors.newPassword && (
                  <div className="error-message" id="new-password-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.newPassword}
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="form-group">
                 <div className="input-icon password"></div>
                 <div className="password-input-container">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    placeholder="Confirmer le nouveau mot de passe *"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className={errors.confirmNewPassword ? 'error' : ''}
                    required
                     autoComplete="new-password"
                    aria-invalid={errors.confirmNewPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmNewPassword ? 'confirm-new-password-error' : undefined}
                  />
                   <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleConfirmNewPasswordVisibility}
                        aria-label={showConfirmNewPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                    >
                        {showConfirmNewPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                </div>
                {errors.confirmNewPassword && (
                  <div className="error-message" id="confirm-new-password-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {errors.confirmNewPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-block ${!isFormValid || isLoading ? 'btn-disabled' : ''}`}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Réinitialisation en cours...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </button>
            </form>

            <div className="register-footer">
              <p><Link to="/login">Retour à la connexion</Link></p>
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

export default ResetPassword;