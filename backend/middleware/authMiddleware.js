const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
require("dotenv").config();

// Middleware d'authentification de base
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Accès refusé. Token d'authentification manquant." 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: "Token expiré. Veuillez vous reconnecter.",
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          success: false, 
          message: "Token invalide.",
          code: 'TOKEN_INVALID'
        });
      }

      return res.status(403).json({ 
        success: false, 
        message: "Erreur d'authentification.",
        code: 'AUTH_ERROR'
      });
    }

    // Vérifier que l'utilisateur existe toujours et est actif
    User.findById(decoded.id, (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification utilisateur:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Erreur serveur lors de la vérification de l'utilisateur" 
        });
      }

      if (!results || results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "Utilisateur introuvable ou compte désactivé",
          code: 'USER_NOT_FOUND'
        });
      }

      const user = results[0];
      
      // Ajouter les informations utilisateur à la requête
      req.user = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        departement_id: user.departement_id,
        commune_id: user.commune_id,
        departement_nom: user.departement_nom,
        commune_nom: user.commune_nom
      };

      next();
    });
  });
};

// Middleware pour vérifier le rôle administrateur
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ 
      success: false, 
      message: "Accès refusé. Droits administrateur requis." 
    });
  }

  next();
};

// Middleware pour vérifier l'accès aux données selon la localisation
const locationAccessMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  // Les administrateurs ont accès à toutes les données
  if (req.user.role === 'administrateur') {
    req.accessScope = {
      type: 'admin',
      departement_id: null,
      commune_id: null
    };
    return next();
  }

  // Les membres ont accès uniquement aux données de leur département/commune
  req.accessScope = {
    type: 'membre',
    departement_id: req.user.departement_id,
    commune_id: req.user.commune_id
  };

  next();
};

// Middleware pour logger les activités (avec gestion d'erreur améliorée)
const activityLogMiddleware = (action, description) => {
  return (req, res, next) => {
    // Stocker les informations pour le log
    req.activityLog = {
      action,
      description: typeof description === 'function' ? description(req) : description,
      table_concernee: null,
      id_enregistrement: null,
      donnees_avant: null,
      donnees_apres: null
    };

    // Intercepter la réponse pour logger après traitement
    const originalSend = res.send;
    res.send = function(data) {
      // Logger l'activité si la requête a réussi
      if (res.statusCode < 400 && req.user) {
        const logData = {
          utilisateur_id: req.user.id,
          action: req.activityLog.action,
          description: req.activityLog.description,
          table_concernee: req.activityLog.table_concernee,
          id_enregistrement: req.activityLog.id_enregistrement,
          donnees_avant: req.activityLog.donnees_avant,
          donnees_apres: req.activityLog.donnees_apres,
          adresse_ip: req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null),
          user_agent: req.headers['user-agent']
        };

        // Logger de manière asynchrone pour ne pas bloquer la réponse
        setImmediate(() => {
          User.logActivity(logData, (err) => {
            if (err) {
              console.error('Erreur lors du logging d\'activité:', err);
            }
          });
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

// Middleware pour vérifier les permissions sur les données spécifiques
const dataAccessMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  // Fonction helper pour vérifier l'accès aux données
  req.checkDataAccess = (dataItem) => {
    // Les administrateurs ont accès à tout
    if (req.user.role === 'administrateur') {
      return true;
    }

    // Les membres ont accès uniquement aux données de leur localisation
    if (req.user.departement_id && dataItem.departement_id) {
      return req.user.departement_id === dataItem.departement_id;
    }

    if (req.user.commune_id && dataItem.commune_id) {
      return req.user.commune_id === dataItem.commune_id;
    }

    // Si pas de correspondance exacte, vérifier par nom de commune
    if (dataItem.commune && req.user.commune_nom) {
      return dataItem.commune.toLowerCase() === req.user.commune_nom.toLowerCase();
    }

    return false;
  };

  next();
};

// Middleware pour la validation des taux de requêtes (rate limiting basique)
const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.user ? req.user.id : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Nettoyer les anciennes entrées
    if (requests.has(clientId)) {
      const userRequests = requests.get(clientId).filter(time => time > windowStart);
      requests.set(clientId, userRequests);
    }

    const userRequests = requests.get(clientId) || [];

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Trop de requêtes. Veuillez patienter avant de continuer.",
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Ajouter la requête actuelle
    userRequests.push(now);
    requests.set(clientId, userRequests);

    next();
  };
};

// Middleware pour vérifier les permissions d'importation de fichiers
const importPermissionMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ 
      success: false, 
      message: "Seuls les administrateurs peuvent importer des fichiers" 
    });
  }

  next();
};

// Middleware pour vérifier les permissions de modification des données
const editPermissionMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  req.canEdit = (dataItem) => {
    if (req.user.role === 'administrateur') {
      return true;
    }

    if (req.user.commune_id && dataItem.commune_id) {
      return req.user.commune_id === dataItem.commune_id;
    }

    if (dataItem.commune && req.user.commune_nom) {
      return dataItem.commune.toLowerCase() === req.user.commune_nom.toLowerCase();
    }

    return false;
  };

  next();
};

// Middleware pour vérifier les permissions de suppression
const deletePermissionMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ 
      success: false, 
      message: "Seuls les administrateurs peuvent supprimer des données" 
    });
  }

  next();
};

// Middleware pour filtrer automatiquement les données selon les permissions
const autoFilterMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise" 
    });
  }

  req.getLocationFilter = () => {
    if (req.user.role === 'administrateur') {
      return {};
    }

    const filter = {};
    
    if (req.user.commune_id) {
      filter.commune_filter = `commune = '${req.user.commune_nom}'`;
    } else if (req.user.departement_id) {
      filter.departement_filter = `departement_id = ${req.user.departement_id}`;
    }

    return filter;
  };

  next();
};

// Middleware pour valider les fichiers uploadés
const fileValidationMiddleware = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Type de fichier non autorisé. Seuls les fichiers Excel (.xlsx, .xls) et CSV sont acceptés."
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "Fichier trop volumineux. Taille maximale autorisée : 10 MB."
    });
  }

  req.fileInfo = {
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  };

  next();
};

// Middleware amélioré pour nettoyer les sessions expirées
const sessionCleanupMiddleware = (req, res, next) => {
  // Nettoyer les sessions expirées de façon asynchrone et sécurisée
  setImmediate(() => {
    // Vérifier d'abord la santé de la base de données
    User.checkHealth((healthErr) => {
      if (healthErr) {
        console.warn('Base de données non disponible pour le nettoyage des sessions');
        return;
      }

      // Procéder au nettoyage si la DB est accessible
      User.cleanExpiredSessions((err, results) => {
        if (err) {
          console.error('Erreur lors du nettoyage des sessions:', err);
        } else if (results && results.affectedRows > 0) {
          console.log(`${results.affectedRows} sessions expirées nettoyées`);
        }
      });
    });
  });

  next();
};

module.exports = {
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
};