import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration axios par défaut
  axios.defaults.baseURL = API_URL;

  // Intercepteur pour ajouter automatiquement le token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur pour gérer les erreurs de token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await axios.post('/auth/refresh', { refreshToken });
            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        } else {
          logout();
        }
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        try {
          const response = await axios.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            throw new Error('Échec de récupération des données utilisateur');
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          // Essayer de refresh le token
          try {
            const refreshResponse = await axios.post('/auth/refresh', { refreshToken });
            if (refreshResponse.data.success) {
              localStorage.setItem("accessToken", refreshResponse.data.data.accessToken);
              const userResponse = await axios.get('/auth/me');
              setUser(userResponse.data.data);
            } else {
              throw new Error('Échec du refresh');
            }
          } catch (refreshError) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, mot_de_passe) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/auth/login', {
        email,
        mot_de_passe
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(user);
        
        // Mettre fin au loading immédiatement après avoir défini l'utilisateur
        setLoading(false);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Erreur de connexion');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      setLoading(false); // Important : arrêter le loading même en cas d'erreur
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/auth/register', userData);

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put('/auth/profile', profileData);
      
      if (response.data.success) {
        // Mettre à jour les données utilisateur localement
        setUser(prevUser => ({
          ...prevUser,
          ...response.data.data
        }));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePassword = useCallback(async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      setError(null);
      // No explicit setLoading(true) here to avoid interfering with global loading state for profile update,
      // Profile component handles its own loading for password change.

      const response = await axios.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmNewPassword
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      throw new Error(errorMessage);
    }
  }, []); // Dependencies are empty because it doesn't rely on any external variables
  const clearError = () => setError(null);

  const forgotPassword = async (email) => {
    try {
      setError(null);
      // setLoading(true); // Optional: show loading for this specific action

      const response = await axios.post('/auth/forgot-password', { email });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        // Although the backend sends success even on user not found for security,
        // this check handles potential other backend errors.
        throw new Error(response.data.message || 'Erreur lors de la demande de réinitialisation.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Erreur lors de la demande de réinitialisation.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      // setLoading(false); // Optional: stop loading
    }
  };

  const resetPassword = async (token, newPassword, confirmNewPassword) => {
    try {
      setError(null);
      const response = await axios.post('/auth/reset-password', { token, newPassword, confirmNewPassword });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la réinitialisation du mot de passe.');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Erreur lors de la réinitialisation du mot de passe.');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'administrateur'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}