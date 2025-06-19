const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique avec timestamp et nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Nettoyer le nom de fichier pour éviter les caractères spéciaux
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    cb(null, `${cleanBaseName}_${uniqueSuffix}${extension}`);
  }
});

// Fonction de filtrage des fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  const allowedMimeTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv' // .csv (optionnel si vous voulez supporter CSV)
  ];

  // Vérifier l'extension du fichier
  const allowedExtensions = ['.xls', '.xlsx', '.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    const error = new Error('Type de fichier non supporté. Seuls les fichiers Excel (.xls, .xlsx) sont acceptés.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
    files: 1 // Un seul fichier à la fois
  }
});

// Middleware de gestion des erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Le fichier est trop volumineux. Taille maximum autorisée : 10MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers. Un seul fichier autorisé à la fois.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de l\'upload du fichier.',
          error: error.code
        });
    }
  } else if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  // Autres erreurs
  console.error('Erreur d\'upload:', error);
  return res.status(500).json({
    success: false,
    message: 'Erreur interne lors de l\'upload du fichier.',
    error: 'INTERNAL_ERROR'
  });
};

// Middleware pour nettoyer les fichiers temporaires en cas d'erreur
const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Fonction de nettoyage
  const cleanup = () => {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier temporaire:', err);
        }
      });
    }
  };

  // Override des méthodes de réponse pour nettoyer en cas d'erreur
  res.send = function(data) {
    if (res.statusCode >= 400) {
      cleanup();
    }
    originalSend.call(this, data);
  };

  res.json = function(data) {
    if (res.statusCode >= 400) {
      cleanup();
    }
    originalJson.call(this, data);
  };

  next();
};

// Middleware de validation personnalisée
const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier sélectionné.',
      error: 'NO_FILE'
    });
  }

  // Vérifications supplémentaires
  const fileInfo = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  };

  // Ajouter les informations du fichier à la requête
  req.fileInfo = fileInfo;

  console.log('📁 Fichier uploadé avec succès:', fileInfo);
  next();
};

// Middleware principal pour l'upload de fichiers Excel
const uploadExcel = [
  cleanupTempFiles,
  upload.single('file'),
  handleUploadError,
  validateUpload
];

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier:', err);
        reject(err);
      } else {
        console.log('Fichier supprimé avec succès:', filePath);
        resolve();
      }
    });
  });
};

// Fonction utilitaire pour obtenir les informations d'un fichier
const getFileInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          size: stats.size,
          createdDate: stats.birthtime,
          modifiedDate: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory()
        });
      }
    });
  });
};

// Fonction pour nettoyer les anciens fichiers (à utiliser périodiquement)
const cleanupOldFiles = (maxAgeInDays = 7) => {
  return new Promise((resolve, reject) => {
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const now = Date.now();
      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convertir en millisecondes

      const deletePromises = files.map(filename => {
        return new Promise((resolveFile, rejectFile) => {
          const filePath = path.join(uploadsDir, filename);
          fs.stat(filePath, (statErr, stats) => {
            if (statErr) {
              console.error('Erreur lors de la lecture des stats du fichier:', statErr);
              resolveFile(); // Ne pas faire échouer le processus pour un fichier
              return;
            }

            const fileAge = now - stats.mtime.getTime();
            if (fileAge > maxAge) {
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Erreur lors de la suppression du fichier ancien:', unlinkErr);
                } else {
                  console.log('Fichier ancien supprimé:', filename);
                }
                resolveFile();
              });
            } else {
              resolveFile();
            }
          });
        });
      });

      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    });
  });
};

module.exports = {
  uploadExcel,
  upload,
  handleUploadError,
  cleanupTempFiles,
  validateUpload,
  deleteFile,
  getFileInfo,
  cleanupOldFiles,
  uploadsDir
};