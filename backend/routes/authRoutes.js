const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/UserModel");

// Import correct des middlewares
const {
  authMiddleware,
  adminMiddleware,
  locationAccessMiddleware,
  activityLogMiddleware,
  dataAccessMiddleware,
  rateLimitMiddleware,
  importPermissionMiddleware,
  editPermissionMiddleware,
  deletePermissionMiddleware,
  autoFilterMiddleware,
  fileValidationMiddleware,
  sessionCleanupMiddleware
} = require("../middleware/authMiddleware");

const { body, validationResult } = require("express-validator");
require("dotenv").config();

const router = express.Router();

// Utilitaires pour générer les tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      departement_id: user.departement_id,
      commune_id: user.commune_id
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Fonction pour obtenir l'IP du client
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// 📌 Obtenir la liste des départements et communes
router.get("/locations", 
  rateLimitMiddleware(50, 15 * 60 * 1000), // 50 requêtes par 15 minutes
  sessionCleanupMiddleware,
  (req, res) => {
    User.getDepartements((err, departements) => {
      if (err) {
        console.error("Erreur récupération départements:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la récupération des départements" 
        });
      }

      User.getAllCommunes((err, communes) => {
        if (err) {
          console.error("Erreur récupération communes:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des communes" 
          });
        }

        res.json({
          success: true,
          data: {
            departements,
            communes
          }
        });
      });
    });
  }
);

// 📌 Obtenir les communes d'un département spécifique
router.get("/communes/:departement_id", 
  rateLimitMiddleware(100, 15 * 60 * 1000),
  sessionCleanupMiddleware,
  (req, res) => {
    const { departement_id } = req.params;

    // Validation de l'ID du département
    if (!departement_id || isNaN(departement_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de département invalide" 
      });
    }

    User.getCommunesByDepartement(departement_id, (err, communes) => {
      if (err) {
        console.error("Erreur récupération communes par département:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors de la récupération des communes" 
        });
      }

      res.json({
        success: true,
        data: communes
      });
    });
  }
);

// 📌 Inscription d'un utilisateur
router.post("/register", [
  // Rate limiting plus strict pour l'inscription
  rateLimitMiddleware(5, 15 * 60 * 1000), // 5 tentatives par 15 minutes
  sessionCleanupMiddleware,
  
  // Validations
  body("nom")
    .notEmpty()
    .withMessage("Le nom est requis")
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom doit contenir entre 2 et 100 caractères")
    .trim()
    .escape(),
  
  body("prenom")
    .notEmpty()
    .withMessage("Le prénom est requis")
    .isLength({ min: 2, max: 100 })
    .withMessage("Le prénom doit contenir entre 2 et 100 caractères")
    .trim()
    .escape(),
  
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email trop long"),
  
  body("telephone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Numéro de téléphone invalide"),
  
  body("mot_de_passe")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial"),
  
  body("departement_id")
    .isInt({ min: 1 })
    .withMessage("Département requis"),
  
  body("commune_id")
    .isInt({ min: 1 })
    .withMessage("Commune requise")
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array()
      });
    }

    const { nom, prenom, email, telephone, mot_de_passe, departement_id, commune_id } = req.body;

    // Vérifier si l'email existe déjà
    User.checkEmailExists(email, async (err, results) => {
      if (err) {
        console.error("Erreur vérification email:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur serveur lors de la vérification de l'email" 
        });
      }

      if (results.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: "Un compte avec cet email existe déjà" 
        });
      }

      // Hasher le mot de passe avec un coût plus élevé
      const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

      const userData = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.toLowerCase().trim(),
        telephone: telephone ? telephone.trim() : null,
        mot_de_passe: hashedPassword,
        role: 'membre', // Par défaut, les nouveaux utilisateurs sont des membres
        departement_id: parseInt(departement_id),
        commune_id: parseInt(commune_id)
      };

      User.create(userData, (err, result) => {
        if (err) {
          console.error("Erreur création utilisateur:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de l'inscription" 
          });
        }

        // Logger l'activité
        const logData = {
          utilisateur_id: result.insertId,
          action: 'INSCRIPTION',
          description: `Inscription de ${prenom} ${nom}`,
          table_concernee: 'utilisateurs',
          id_enregistrement: result.insertId,
          donnees_apres: JSON.stringify({ nom, prenom, email, role: 'membre' }),
          adresse_ip: getClientIP(req),
          user_agent: req.headers['user-agent']
        };

        User.logActivity(logData, (logErr) => {
          if (logErr) {
            console.error("Erreur lors du logging de l'inscription:", logErr);
          }
        });

        res.status(201).json({ 
          success: true, 
          message: "Inscription réussie ✅",
          data: {
            id: result.insertId,
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email
          }
        });
      });
    });

  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de l'inscription" 
    });
  }
});

// 📌 Connexion d'un utilisateur
router.post("/login", [
  rateLimitMiddleware(10, 15 * 60 * 1000), // 10 tentatives par 15 minutes
  sessionCleanupMiddleware,
  
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  
  body("mot_de_passe")
    .notEmpty()
    .withMessage("Mot de passe requis")
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array()
      });
    }

    const { email, mot_de_passe } = req.body;

    User.findByEmail(email.toLowerCase().trim(), async (err, results) => {
      if (err) {
        console.error("Erreur recherche utilisateur:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur serveur" 
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "Email ou mot de passe incorrect" 
        });
      }

      const user = results[0];

      // Vérifier si l'utilisateur est actif
      if (user.statut !== 'actif') {
        return res.status(401).json({ 
          success: false, 
          message: "Compte inactif ou suspendu. Contactez l'administrateur." 
        });
      }

      try {
        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isMatch) {
          return res.status(401).json({ 
            success: false, 
            message: "Email ou mot de passe incorrect" 
          });
        }

        // Générer les tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        // Créer la session
        const sessionData = {
          utilisateur_id: user.id,
          refresh_token: refreshToken,
          expire_le: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          adresse_ip: getClientIP(req),
          user_agent: req.headers['user-agent']
        };

        User.createSession(sessionData, (err) => {
          if (err) {
            console.error("Erreur création session:", err);
          }
        });

        // Mettre à jour la dernière connexion
        User.updateLastLogin(user.id, (err) => {
          if (err) {
            console.error("Erreur mise à jour dernière connexion:", err);
          }
        });

        // Logger l'activité
        const logData = {
          utilisateur_id: user.id,
          action: 'CONNEXION',
          description: `Connexion de ${user.prenom} ${user.nom}`,
          table_concernee: 'utilisateurs',
          id_enregistrement: user.id,
          adresse_ip: getClientIP(req),
          user_agent: req.headers['user-agent']
        };

        User.logActivity(logData, (err) => {
          if (err) {
            console.error("Erreur lors du logging de la connexion:", err);
          }
        });

        // Répondre avec les informations utilisateur (sans le mot de passe)
        const userData = {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          departement: {
            id: user.departement_id,
            nom: user.departement_nom,
            code: user.departement_code
          },
          commune: {
            id: user.commune_id,
            nom: user.commune_nom,
            code: user.commune_code
          },
          date_inscription: user.date_inscription,
          derniere_connexion: user.derniere_connexion
        };

        res.json({ 
          success: true,
          message: "Connexion réussie ✅",
          data: {
            accessToken,
            refreshToken,
            user: userData
          }
        });

      } catch (error) {
        console.error("Erreur lors de la vérification du mot de passe:", error);
        res.status(500).json({ 
          success: false, 
          message: "Erreur serveur lors de la connexion" 
        });
      }
    });

  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la connexion" 
    });
  }
});

// 📌 Rafraîchir le token d'accès
router.post("/refresh", 
  rateLimitMiddleware(30, 15 * 60 * 1000),
  sessionCleanupMiddleware,
  (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Refresh token manquant" 
      });
    }

    User.findSessionByToken(refreshToken, (err, results) => {
      if (err) {
        console.error("Erreur recherche session:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur serveur" 
        });
      }

      if (results.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: "Refresh token invalide ou expiré" 
        });
      }

      const session = results[0];
      
      // Vérifier si la session n'est pas expirée
      if (new Date() > new Date(session.expire_le)) {
        return res.status(403).json({ 
          success: false, 
          message: "Session expirée" 
        });
      }
      
      // Récupérer les informations complètes de l'utilisateur
      User.findById(session.utilisateur_id, (err, userResults) => {
        if (err) {
          console.error("Erreur recherche utilisateur pour refresh:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur serveur" 
          });
        }

        if (userResults.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "Utilisateur introuvable" 
          });
        }

        const user = userResults[0];

        // Vérifier si l'utilisateur est toujours actif
        if (user.statut !== 'actif') {
          return res.status(401).json({ 
            success: false, 
            message: "Compte inactif ou suspendu" 
          });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({ 
          success: true,
          data: {
            accessToken: newAccessToken
          }
        });
      });
    });
  }
);

// 📌 Déconnexion
router.post("/logout", 
  authMiddleware,
  activityLogMiddleware('DECONNEXION', 'Déconnexion utilisateur'),
  (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      User.deleteSession(refreshToken, (err) => {
        if (err) {
          console.error("Erreur suppression session:", err);
        }
      });
    }

    // Les informations pour le log sont automatiquement gérées par activityLogMiddleware
    req.activityLog.table_concernee = 'sessions_utilisateur';

    res.json({ 
      success: true, 
      message: "Déconnexion réussie ✅" 
    });
  }
);

// 📌 Récupération des informations de l'utilisateur connecté
router.get("/me", 
  authMiddleware,
  dataAccessMiddleware,
  (req, res) => {
    User.findById(req.user.id, (err, results) => {
      if (err) {
        console.error("Erreur recherche utilisateur /me:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur serveur" 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Utilisateur introuvable" 
        });
      }

      const user = results[0];
      const userData = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        statut: user.statut,
        departement: {
          id: user.departement_id,
          nom: user.departement_nom,
          code: user.departement_code
        },
        commune: {
          id: user.commune_id,
          nom: user.commune_nom,
          code: user.commune_code
        },
        date_inscription: user.date_inscription,
        derniere_connexion: user.derniere_connexion
      };

      res.json({ 
        success: true,
        data: userData 
      });
    });
  }
);

// 📌 Mise à jour du profil utilisateur
router.put("/profile", 
  authMiddleware,
  dataAccessMiddleware,
  activityLogMiddleware('MISE_A_JOUR_PROFIL', (req) => `Mise à jour du profil de ${req.user.prenom} ${req.user.nom}`),
  [
    body("nom")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Le nom doit contenir entre 2 et 100 caractères")
      .trim()
      .escape(),
    
    body("prenom")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Le prénom doit contenir entre 2 et 100 caractères")
      .trim()
      .escape(),
    
    body("telephone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Numéro de téléphone invalide"),
    
    body("mot_de_passe_actuel")
      .optional()
      .notEmpty()
      .withMessage("Mot de passe actuel requis pour le changement"),
    
    body("nouveau_mot_de_passe")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Le nouveau mot de passe doit contenir au moins 8 caractères")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage("Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array()
        });
      }

      const { nom, prenom, telephone, mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;
      const userId = req.user.id;

      // Récupérer les données actuelles pour le log
      User.findById(userId, async (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "Utilisateur introuvable" 
          });
        }

        const currentUser = results[0];
        const updateData = {};

        // Préparer les données à mettre à jour
        if (nom && nom !== currentUser.nom) updateData.nom = nom.trim();
        if (prenom && prenom !== currentUser.prenom) updateData.prenom = prenom.trim();
        if (telephone && telephone !== currentUser.telephone) updateData.telephone = telephone.trim();

        // Gestion du changement de mot de passe
        if (nouveau_mot_de_passe) {
          if (!mot_de_passe_actuel) {
            return res.status(400).json({
              success: false,
              message: "Mot de passe actuel requis pour changer le mot de passe"
            });
          }

          const isCurrentPasswordValid = await bcrypt.compare(mot_de_passe_actuel, currentUser.mot_de_passe);
          if (!isCurrentPasswordValid) {
            return res.status(400).json({
              success: false,
              message: "Mot de passe actuel incorrect"
            });
          }

          updateData.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, 12);
        }

        // Si aucune donnée à mettre à jour
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            success: false,
            message: "Aucune modification détectée"
          });
        }

        // Effectuer la mise à jour
        User.updateProfile(userId, updateData, (err, result) => {
          if (err) {
            console.error("Erreur mise à jour profil:", err);
            return res.status(500).json({
              success: false,
              message: "Erreur lors de la mise à jour du profil"
            });
          }

          // Préparer les données pour le log
          req.activityLog.table_concernee = 'utilisateurs';
          req.activityLog.id_enregistrement = userId;
          req.activityLog.donnees_avant = JSON.stringify({
            nom: currentUser.nom,
            prenom: currentUser.prenom,
            telephone: currentUser.telephone
          });
          req.activityLog.donnees_apres = JSON.stringify(updateData);

          res.json({
            success: true,
            message: "Profil mis à jour avec succès ✅",
            data: {
              nom: updateData.nom || currentUser.nom,
              prenom: updateData.prenom || currentUser.prenom,
              telephone: updateData.telephone || currentUser.telephone
            }
          });
        });
      });

    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour du profil"
      });
    }
  }
);

// 📌 Nettoyage des sessions expirées (route utilitaire)
router.post("/cleanup-sessions", 
  authMiddleware,
  adminMiddleware,
  activityLogMiddleware('NETTOYAGE_SESSIONS', 'Nettoyage des sessions expirées'),
  (req, res) => {
    User.cleanExpiredSessions((err, result) => {
      if (err) {
        console.error("Erreur nettoyage sessions:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur lors du nettoyage" 
        });
      }

      req.activityLog.table_concernee = 'sessions_utilisateur';
      req.activityLog.description = `${result.affectedRows} sessions expirées supprimées`;

      res.json({ 
        success: true, 
        message: `${result.affectedRows} sessions expirées supprimées ✅`,
        data: {
          sessions_supprimees: result.affectedRows
        }
      });
    });
  }
);

// 📌 Obtenir les statistiques d'utilisation (pour les admins)
router.get("/stats", 
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    // Cette route pourrait être étendue pour fournir des statistiques d'utilisation
    User.getUserStats((err, stats) => {
      if (err) {
        console.error("Erreur récupération statistiques:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la récupération des statistiques"
        });
      }

      res.json({
        success: true,
        data: stats
      });
    });
  }
);

// 📌 Route de santé pour vérifier le statut de l'API
router.get("/health", 
  rateLimitMiddleware(100, 5 * 60 * 1000), // 100 requêtes par 5 minutes
  (req, res) => {
    res.json({
      success: true,
      message: "API Auth fonctionnelle",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  }
);

module.exports = router;