import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import '../styles/Profile.css'; // Assume a CSS file for better styling

function Profile() {
  const { user, loading, error, updateProfile, clearError } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        telephone: user.telephone || "",
      });
    } else if (!loading) {
      // If user is null and not loading, it means they are not authenticated
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [user, loading, navigate]);

  // Clear success messages when relevant data changes
  useEffect(() => {
    // Clear success message when form data changes
    if (profileUpdateSuccess) {
      setProfileUpdateSuccess("");
    }
  }, [formData, profileUpdateSuccess]);

   // Clear password success message when password data changes
   useEffect(() => {
     // Clear general error when password data changes if it exists
     clearError();
    if (validationErrors.passwordChangeSuccess) {
      setValidationErrors(prev => ({ ...prev, passwordChangeSuccess: undefined }));
    }
  }, [formData, successMessage]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for the field when it changes
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    clearError(); // Clear general error on any input change
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
        ...prev,
        [name]: value,
    }));
    // Clear specific password validation error when it changes
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    clearError(); // Clear general error on any input change
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis";
    }
    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis";
    }
    // Basic phone validation (optional field, but validate if entered)
    if (formData.telephone && !/^\d{8,}$/.test(formData.telephone)) {
      errors.telephone = "Numéro de téléphone invalide";
    }
    return errors;
  };

   const validatePasswordForm = () => {
      const errors = {};
      if (!passwordData.currentPassword) {
          errors.currentPassword = "Le mot de passe actuel est requis";
      }
      if (!passwordData.newPassword) {
          errors.newPassword = "Le nouveau mot de passe est requis";
      } else if (passwordData.newPassword.length < 8) {
          errors.newPassword = "Le nouveau mot de passe doit contenir au moins 8 caractères";
      } else {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
          if (!passwordRegex.test(passwordData.newPassword)) {
              errors.newPassword = "Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial";
          }
      }
      if (!passwordData.confirmNewPassword) {
          errors.confirmNewPassword = "La confirmation du nouveau mot de passe est requise";
      } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
          errors.confirmNewPassword = "Les nouveaux mots de passe ne correspondent pas";
      }
       if (passwordData.currentPassword === passwordData.newPassword && passwordData.currentPassword !== "") {
           errors.newPassword = "Le nouveau mot de passe doit être différent du mot de passe actuel";
       }

      return errors;
   };

  const handleUpdateProfile = async (e) => {
     if (isSubmitting) return; // Prevent double submission

     // If password change form is active, handle that instead
     if (isPasswordChanging) return;

    e.preventDefault();
    clearError();
    setProfileUpdateSuccess("");
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Only send fields that might have changed
      const updatedFields = {};
       if (formData.nom.trim() !== (user.nom || '').trim()) {
         updatedFields.nom = formData.nom.trim();
       }
       if (formData.prenom.trim() !== (user.prenom || '').trim()) {
          updatedFields.prenom = formData.prenom.trim();
       }
       if (formData.telephone.trim() !== (user.telephone || '').trim()) {
           updatedFields.telephone = formData.telephone.trim();
       }


      // Check if there are actual changes
      if (Object.keys(updatedFields).length === 0) {
         setProfileUpdateSuccess("Aucune modification détectée.");
         setIsSubmitting(false);
         // Optionally clear success message after a delay if no changes detected
         return;

      // Assuming updateProfile in AuthContext now accepts an object of fields
      const result = await updateProfile(updatedFields);

      if (result.success) {
        setProfileSuccessMessage(result.message || "Profil mis à jour avec succès !");
      }
    } catch (err) {
       // The error is already set in AuthContext's global state
        console.error("Profile update failed:", err);
        setProfileUpdateSuccess(""); // Clear any previous success message on error
        // AuthContext\'s updateProfile should set the global error state
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleChangePassword = async (e) => {
     if (isPasswordChanging) return; // Prevent double submission

      e.preventDefault();
      clearError();
      setPasswordChangeSuccess(""); // Clear any previous success message
      setValidationErrors({}); // Clear previous validation errors

      const errors = validatePasswordForm();
       if (Object.keys(errors).length > 0) {
         setValidationErrors(errors);
         return;
       }

       setIsPasswordChanging(true);

    try {
      // Assuming updatePassword in AuthContext exists and handles the API call and returns { success: boolean, message: string }
      const result = await updatePassword(passwordData);
      if (result.success) {
        setPasswordChangeSuccess(result.message || "Mot de passe changé avec succès !");
      }
    } catch (err) {
        // Error is handled by AuthContext and set to the error state
        // The specific error message from AuthContext should be displayed globally or mapped
        // No need to explicitly set errors here if AuthContext manages it globally
         console.error("Password change failed:", err);
         setSuccessMessage(""); // Clear any previous success message on error
    } finally {
      setIsPasswordChanging(false);
       // Clear password fields regardless of success for security
       setPasswordData({
           currentPassword: "",
           newPassword: "",
           confirmNewPassword: "",
       });
    }
   };

   // Timer to clear success messages
   useEffect(() => {
     if (profileUpdateSuccess) {
       const timer = setTimeout(() => {
         setProfileUpdateSuccess("");
       }, 5000); // Clear after 5 seconds
       return () => clearTimeout(timer);
     }
      if (passwordChangeSuccess) {
        const timer = setTimeout(() => {
          setPasswordChangeSuccess("");
        }, 5000); // Clear after 5 seconds
        return () => clearTimeout(timer);
      }
   };

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Toggle password visibility functions
   const toggleCurrentPasswordVisibility = () => {
     setShowCurrentPassword(!showCurrentPassword);
   };
   const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
   };
   const toggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  // Show loading state from AuthContext
  if (loading || !user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>

      {profileUpdateSuccess && (
        <div style={{ color: "green", marginBottom: "10px" }}>
          {profileUpdateSuccess}
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} noValidate>
        <div className="form-group">
          <label htmlFor="nom">Nom:</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className={validationErrors.nom ? "error" : ""}
            required
          />
          {validationErrors.nom && (
            <div className="error-message">{validationErrors.nom}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom:</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            className={validationErrors.prenom ? "error" : ""}
            required
          />
          {validationErrors.prenom && (
            <div className="error-message">{validationErrors.prenom}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          {/* Email is typically not changeable via profile page, display as read-only */}
          <input type="email" id="email" value={user.email} disabled readOnly />
        </div>

         <div className="form-group">
          <label htmlFor="role">Rôle:</label>
          {/* Role is typically not changeable via profile page, display as read-only */}
          <input type="text" id="role" value={user.role} disabled readOnly />
        </div>

         <div className="form-group">
          <label htmlFor="departement">Département:</label>
          {/* Department is typically not changeable via profile page, display as read-only */}
          <input type="text" id="departement" value={user.departement?.nom || 'N/A'} disabled readOnly />
        </div>

        <div className="form-group">
          <label htmlFor="commune">Commune:</label>
          {/* Commune is typically not changeable via profile page, display as read-only */}
          <input type="text" id="commune" value={user.commune?.nom || 'N/A'} disabled readOnly />
        </div>


        <div className="form-group">
          <label htmlFor="telephone">Téléphone:</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className={validationErrors.telephone ? "error" : ""}
          />
          {validationErrors.telephone && (
            <div className="error-message">{validationErrors.telephone}</div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || loading || isPasswordChanging}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      <hr style={{ margin: '40px 0' }} /> {/* Separator */}

      <h2>Changer le mot de passe</h2>

      {passwordChangeSuccess && (
         <div style={{ color: "green", marginBottom: "10px" }}>
           {passwordChangeSuccess}
         </div>
      )}

      <form onSubmit={handleChangePassword} noValidate>
         <div className="form-group">
            <label htmlFor="currentPassword">Mot de passe actuel:</label>
            <div className="password-input-container">
               <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className={validationErrors.currentPassword ? "error" : ""}
                  required
                  autoComplete="current-password"
               />
                <button
                   type="button"
                   className="password-toggle"
                   onClick={toggleCurrentPasswordVisibility}
                   aria-label={showCurrentPassword ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"}
                 >
                   {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                 </button>
             </div>
            {validationErrors.currentPassword && (
              <div className="error-message">{validationErrors.currentPassword}</div>
            )}
         </div>

         <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe:</label>
            <div className="password-input-container">
               <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className={validationErrors.newPassword ? "error" : ""}
                  required
                  autoComplete="new-password"
               />
                <button
                   type="button"
                   className="password-toggle"
                   onClick={toggleNewPasswordVisibility}
                   aria-label={showNewPassword ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"}
                 >
                   {showNewPassword ? "👁️" : "👁️‍🗨️"}
                 </button>
            </div>
            {validationErrors.newPassword && (
              <div className="error-message">{validationErrors.newPassword}</div>
            )}
         </div>

         <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe:</label>
             <div className="password-input-container">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordInputChange}
                  className={validationErrors.confirmNewPassword ? "error" : ""}
                  required
                   autoComplete="new-password"
                />
                 <button
                   type="button"
                   className="password-toggle"
                   onClick={toggleConfirmNewPasswordVisibility}
                   aria-label={showConfirmNewPassword ? "Masquer la confirmation du nouveau mot de passe" : "Afficher la confirmation du nouveau mot de passe"}
                 >
                   {showConfirmNewPassword ? "👁️" : "👁️‍🗨️"}
                 </button>
            </div>
            {validationErrors.confirmNewPassword && (
              <div className="error-message">{validationErrors.confirmNewPassword}</div>
            )}
         </div>

         <button type="submit" disabled={isPasswordChanging || loading || isSubmitting}>
           {isPasswordChanging ? "Changement en cours..." : "Changer le mot de passe"}
         </button>
      </form>


      {/* Basic inline styles for demonstration */}
      <style jsx>{`
        .profile-container {
          max-width: 700px; /* Slightly wider to accommodate new sections */
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        /* Rest of the styles will be in Profile.css */

         .password-input-container {
             position: relative;
         }

         .password-input-container input[type="text"],
         .password-input-container input[type="password"] {
              padding-right: 40px; /* Make space for the toggle button */
         }

         .password-toggle {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              cursor: pointer;
              padding: 0;
              font-size: 1.2em;
         }
         .password-toggle:disabled {
             cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default Profile;