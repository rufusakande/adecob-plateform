import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll add forgotPassword logic here directly or import AuthContext later
import Layout from '../Layouts/Layout'; // Assuming a Layout component exists
import '../styles/login.css'; // Assuming shared styling

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL; // Fallback API URL

  const navigate = useNavigate();

  // Basic client-side email validation
  const validateEmail = (email) => {
    if (!email) {
      return 'L\'email est requis';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Format d\'email invalide';
    }
    return '';
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear validation error on input change
    if (emailError) {
      setEmailError('');
    }
    // Clear general error and success message
    if (error) setError(null);
    if (successMessage) setSuccessMessage('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');
    setEmailError(''); // Clear previous email error

    try {
      // TODO: Integrate with AuthContext forgotPassword function later
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Si l\'email est dans notre système, un lien de réinitialisation a été envoyé.');
        setEmail(''); // Clear email field on success
      } else {
        // Handle specific backend errors if needed, though the backend is designed not to reveal if email exists
        setError(response.data.message || 'Une erreur est survenue lors de la demande.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
       const errorMessage = err.response?.data?.message || 'Une erreur réseau ou serveur est survenue.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <main className="main-content animate"> {/* Assuming 'animate' class for consistent styling */}
        <div className="auth-container"> {/* Using auth-container for consistent layout */}
          <div className="auth-card"> {/* Using auth-card for consistent styling */}
            <div className="auth-header"> {/* Using auth-header for consistent styling */}
              <h1 className="title">Mot de passe oublié ?</h1>
              <p className="subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            {/* General Error Message */}
            {error && (
              <div className="alert alert-error">
                <div className="alert-icon">⚠</div>
                <div className="alert-content">
                  <strong>Erreur</strong>
                  <p>{error}</p>
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

            <form className="auth-form" onSubmit={handleForgotPassword} noValidate> {/* Using auth-form */}
              <div className="form-group">
                <div className="input-icon email"></div>
                <input
                  type="email"
                  name="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={handleInputChange}
                  className={emailError ? 'error' : ''}
                  required
                  autoComplete="email"
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <div className="error-message" id="email-error" role="alert">
                    <span className="error-icon">⚠</span>
                    {emailError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-block ${!email || isSubmitting ? 'btn-disabled' : ''}`}
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien'
                )}
              </button>
            </form>

            <div className="auth-footer"> {/* Using auth-footer */}
              <p><Link to="/login">Retour à la connexion</Link></p>
            </div>
          </div>

          <div className="auth-graphic"> {/* Using auth-graphic */}
            <div className="graphic-element circle-1"></div>
            <div className="graphic-element circle-2"></div>
            <div className="graphic-element square"></div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default ForgotPassword;