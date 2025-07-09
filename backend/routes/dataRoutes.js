const express = require("express");
const db = require("../config/db");
const {upload} = require("../middleware/uploadMiddleware");
const importService = require("../services/importService");
const { query, validationResult, param, body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ensure adminMiddleware is imported if needed elsewhere
const { fileValidationMiddleware } = require('../middleware/fileValidationMiddleware'); // Assuming fileValidationMiddleware is here
const dataService = require("../services/dataService"); // Assuming this service exists and handles DB interaction
const logService = require("../services/logService");
const PDFDocument = require('pdfkit');

const router = express.Router();

// 📌 Route pour importer un fichier Excel
router.post("/import", upload.single("file"), async (req, res) => {
router.post(
  "/import",
  authMiddleware, // Check if user is authenticated
  upload.single("file"), // Handle file upload
  fileValidationMiddleware, // Validate file type and size
  async (req, res) => {
  try {
    // No express-validator needed here for file upload, handled by multer

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé." });
    }

    console.log("📂 Fichier reçu :", req.file);
    
    const result = await importService.processExcelFile(req.file, req.user.id);
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'import_excel',
      `Import du fichier: ${req.file.originalname}`,
      'importations',
      result.importId,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: "Importation réussie ✅",
      importId: result.importId,
      totalImported: result.totalImported,
      errors: result.errors
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'importation :", error);
    res.status(500).json({ 
      message: "Erreur lors de l'importation", 
      error: error.message 
    });
  }
});

// 📌 Route GET optimisée pour la pagination avec contrôle d'accès
const safeColumns = [
  'id', 'nom_enqueteur', 'numero_enquete', 'commune', 'village_quartier',
  'hameau', 'secteur_domaine', 'type_infrastructure', 'nom_infrastructure',
  'annee_realisation', 'bailleur', 'type_materiaux', 'etat_fonctionnement',
  'niveau_degradation', 'mode_gestion', 'precise', 'defectuosites_relevees',
  'mesures_proposees', 'observation_generale', 'rehabilitation', 'localisation',
  'latitude', 'longitude', 'altitude', 'precision_gps', 'date_creation',
  'created_at', 'updated_at', 'statut_traitement', 'date_traitement',
  'traite_par_utilisateur_id', 'observations_internes'
];

router.get("/", [
  query('page').optional().isInt({ gt: 0 }).toInt(),
  query('limit').optional().isInt({ gt: 0 }).toInt(),
  query('search').optional().trim().escape(),
  query('sortBy').optional().isIn(safeColumns),
  query('sortDirection').optional().isIn(['asc', 'desc']),
  query('commune').optional().trim().escape(),
  query('statut_traitement').optional().trim().escape(),
  query('etat_fonctionnement').optional().trim().escape(),
  query('type_infrastructure').optional().trim().escape(),
], async (req, res) => {
router.get("/", async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      sortBy: req.query.sortBy || 'id',
      sortDirection: req.query.sortDirection || 'desc',
      commune: req.query.commune || '',
      statut_traitement: req.query.statut_traitement || '',
      etat_fonctionnement: req.query.etat_fonctionnement || '',
      type_infrastructure: req.query.type_infrastructure || ''
    };

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Use the validated and sanitized options
    const result = await dataService.getInfrastructures(options, req.user);
    res.json(result);

  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des données" 
    });
  }
});

// 📌 Route pour obtenir une infrastructure spécifique
router.get("/:id", [
  param('id').isInt({ gt: 0 }).withMessage('ID de l\'infrastructure doit être un entier positif'),
], async (req, res) => {
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const infrastructure = await dataService.getInfrastructureById(id, req.user);
    
    if (!infrastructure) {
      return res.status(404).json({ message: "Infrastructure non trouvée" });
    }
    
    res.json(infrastructure);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'infrastructure:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Route pour mettre à jour une infrastructure
router.put("/:id", [
  param('id').isInt({ gt: 0 }).withMessage('ID de l\'infrastructure doit être un entier positif'),
  body('commune').optional().trim().escape(),
  body('village_quartier').optional().trim().escape(),
  body('secteur_domaine').optional().trim().escape(),
  body('type_infrastructure').optional().trim().escape(),
  body('nom_infrastructure').optional().trim().escape(),
  body('annee_realisation').optional().isInt({ gt: 1900, lte: new Date().getFullYear() }).withMessage('Année de réalisation doit être une année valide').toInt(),
  body('bailleur').optional().trim().escape(),
  body('type_materiaux').optional().trim().escape(),
  body('etat_fonctionnement').optional().trim().escape(),
  body('niveau_degradation').optional().trim().escape(),
  body('mode_gestion').optional().trim().escape(),
  body('precise').optional().trim().escape(),
  body('defectuosites_relevees').optional().trim().escape(),
  body('mesures_proposees').optional().trim().escape(),
  body('observation_generale').optional().trim().escape(),
  body('latitude').optional().isFloat().withMessage('Latitude doit être un nombre décimal').toFloat(),
  body('longitude').optional().isFloat().withMessage('Longitude doit être un nombre décimal').toFloat(),
  body('altitude').optional().isFloat().withMessage('Altitude doit être un nombre décimal').toFloat(),
  body('precision_gps').optional().isFloat({ gt: 0 }).withMessage('Précision GPS doit être un nombre décimal positif').toFloat(),
  body('observations_internes').optional().trim().escape(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    
    const result = await dataService.updateInfrastructure(id, updateData, req.user);
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'update_infrastructure',
      `Mise à jour infrastructure ID: ${id}`,
      'infrastructures',
      parseInt(id),
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ message: "Infrastructure mise à jour avec succès ✅", data: result });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📌 Supprimer une infrastructure par ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await dataService.deleteInfrastructure(id, req.user);
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'delete_infrastructure',
      `Suppression infrastructure ID: ${id}`,
      'infrastructures',
      parseInt(id),
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ message: "Infrastructure supprimée avec succès ✅" });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📌 Supprimer toutes les infrastructures (admin seulement)
router.delete("/", async (req, res) => {
  try {
    if (req.user.role !== 'administrateur') {
      return res.status(403).json({ message: "Accès interdit" });
    }
    
    const result = await dataService.deleteAllInfrastructures();
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'delete_all_infrastructures',
      `Suppression de toutes les infrastructures`,
      'infrastructures',
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ 
      message: "Toutes les infrastructures ont été supprimées ✅",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
});

// 📌 Routes pour les statistiques
router.get("/stats/general", async (req, res) => {
  try {
    const stats = await dataService.getGeneralStats(req.user);
    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/stats/by-commune", async (req, res) => {
  try {
    const stats = await dataService.getStatsByCommune(req.user);
    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Route pour obtenir les communes autorisées pour l'utilisateur
router.get("/communes/allowed", async (req, res) => {
  try {
    const communes = await dataService.getAllowedCommunes(req.user);
    res.json(communes);
  } catch (error) {
    console.error("Erreur lors de la récupération des communes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Route pour traiter/marquer une infrastructure
router.patch("/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { observations_internes } = req.body;
    
    const result = await dataService.processInfrastructure(id, observations_internes, req.user);
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'process_infrastructure',
      `Traitement infrastructure ID: ${id}`,
      'infrastructures',
      parseInt(id),
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ message: "Infrastructure marquée comme traitée ✅", data: result });
  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📌 Route pour exporter en PDF
router.post("/export/pdf", async (req, res) => {
  try {
    const { ids, filters, search } = req.body;
    
    let infrastructures;
    
    if (ids === 'all') {
      // Exporter toutes les infrastructures selon les filtres
      const options = {
        page: 1,
        limit: 10000, // Grande limite pour récupérer tout
        search: search || '',
        sortBy: 'commune',
        sortDirection: 'asc',
        ...filters
      };
      const result = await dataService.getInfrastructures(options, req.user);
      infrastructures = result.data;
    } else {
      // Exporter seulement les IDs sélectionnés
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "IDs invalides" });
      }
      infrastructures = await dataService.getInfrastructuresByIds(ids, req.user);
    }

    if (!infrastructures || infrastructures.length === 0) {
      return res.status(404).json({ message: "Aucune infrastructure trouvée" });
    }

    // Générer le PDF
    const pdfBuffer = await generateInfrastructuresPDF(infrastructures);
    
    // Log de l'activité
    await logService.logActivity(
      req.user.id,
      'export_pdf',
      `Export PDF de ${infrastructures.length} infrastructure(s)`,
      'exports',
      null,
      req.ip,
      req.get('User-Agent')
    );

    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="infrastructures_export.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'export PDF", 
      error: error.message 
    });
  }
});

// Fonction pour générer le PDF
async function generateInfrastructuresPDF(infrastructures) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 30,
        size: 'A4',
        layout: 'landscape' // Format paysage pour plus d'espace
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // En-tête du document
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text('RAPPORT D\'INFRASTRUCTURES', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.text(`Nombre d'infrastructures: ${infrastructures.length}`, { align: 'right' });
      doc.moveDown(2);

      // Grouper par commune
      const groupedByCommune = {};
      infrastructures.forEach(infra => {
        const commune = infra.commune || 'Non spécifiée';
        if (!groupedByCommune[commune]) {
          groupedByCommune[commune] = [];
        }
        groupedByCommune[commune].push(infra);
      });

      // Générer le contenu pour chaque commune
      Object.keys(groupedByCommune).sort().forEach((commune, communeIndex) => {
        if (communeIndex > 0) {
          doc.addPage();
        }

        // Titre de la commune
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text(`COMMUNE DE ${commune.toUpperCase()}`, { 
          align: 'center',
          underline: true 
        });
        doc.moveDown();

        const communeInfras = groupedByCommune[commune];
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total: ${communeInfras.length} infrastructure(s)`, { align: 'center' });
        doc.moveDown(1.5);

        // Créer le tableau pour cette commune
        generateTableForCommune(doc, communeInfras);
      });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

// Fonction pour générer le tableau d'une commune
function generateTableForCommune(doc, infrastructures) {
  const startY = doc.y;
  const itemHeight = 20;
  const pageHeight = doc.page.height - 60; // Marge bottom
  
  // Définir les colonnes et leurs largeurs
  const columns = [
    { header: 'ID', key: 'id', width: 40, x: 30 },
    { header: 'Village/Quartier', key: 'village_quartier', width: 100, x: 70 },
    { header: 'Type Infrastructure', key: 'type_infrastructure', width: 120, x: 170 },
    { header: 'Nom', key: 'nom_infrastructure', width: 120, x: 290 },
    { header: 'État', key: 'etat_fonctionnement', width: 70, x: 410 },
    { header: 'Année', key: 'annee_realisation', width: 50, x: 480 },
    { header: 'Bailleur', key: 'bailleur', width: 100, x: 530 },
    { header: 'Statut', key: 'statut_traitement', width: 70, x: 630 }
  ];

  let currentY = startY;

  // Dessiner les en-têtes
  drawTableHeader(doc, columns, currentY);
  currentY += itemHeight;

  // Dessiner les lignes de données
  infrastructures.forEach((infra, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (currentY + itemHeight > pageHeight) {
      doc.addPage();
      currentY = 50;
      drawTableHeader(doc, columns, currentY);
      currentY += itemHeight;
    }

    drawTableRow(doc, columns, infra, currentY, index % 2 === 0);
    currentY += itemHeight;
  });
}

// Fonction pour dessiner l'en-tête du tableau
function drawTableHeader(doc, columns, y) {
  doc.fontSize(9).font('Helvetica-Bold');
  
  // Fond gris pour l'en-tête
  doc.rect(30, y, 720, 20).fill('#f0f0f0');
  
  columns.forEach(col => {
    doc.fillColor('black')
       .text(col.header, col.x + 2, y + 5, {
         width: col.width - 4,
         height: 15,
         ellipsis: true
       });
  });
  
  // Bordures
  drawTableBorders(doc, columns, y, 20);
}

// Fonction pour dessiner une ligne du tableau
function drawTableRow(doc, columns, data, y, isEven) {
  doc.fontSize(8).font('Helvetica');
  
  // Couleur de fond alternée
  if (isEven) {
    doc.rect(30, y, 720, 20).fill('#f9f9f9');
  }
  
  columns.forEach(col => {
    let value = data[col.key] || '';
    
    // Formatage spécial pour certaines colonnes
    if (col.key === 'statut_traitement') {
      value = value === 'nouveau' ? 'Nouveau' : 
              value === 'traite' ? 'Traité' : value;
    }
    
    if (col.key === 'etat_fonctionnement') {
      value = value || 'Non spécifié';
    }
    
    doc.fillColor('black')
       .text(String(value), col.x + 2, y + 5, {
         width: col.width - 4,
         height: 15,
         ellipsis: true
       });
  });
  
  // Bordures
  drawTableBorders(doc, columns, y, 20);
}

// Fonction pour dessiner les bordures du tableau
function drawTableBorders(doc, columns, y, height) {
  doc.strokeColor('#cccccc').lineWidth(0.5);
  
  // Bordure horizontale du haut
  doc.moveTo(30, y).lineTo(750, y).stroke();
  
  // Bordure horizontale du bas
  doc.moveTo(30, y + height).lineTo(750, y + height).stroke();
  
  // Bordures verticales
  let currentX = 30;
  columns.forEach((col, index) => {
    doc.moveTo(currentX, y).lineTo(currentX, y + height).stroke();
    currentX += col.width;
    
    // Dernière bordure verticale
    if (index === columns.length - 1) {
      doc.moveTo(currentX, y).lineTo(currentX, y + height).stroke();
    }
  });
}

module.exports = router;