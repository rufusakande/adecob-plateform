const xlsx = require("xlsx");
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

class ImportService {
  
  // Mapping des colonnes Excel vers les colonnes de la base de données
  static getColumnMapping() {
    return {
      'start': 'start',
      'end': 'end',
      'Nom de l\'enquêteur': 'nom_enqueteur',
      'Numéro d\'enquête': 'numero_enquete',
      'Commune': 'commune',
      'Parakou': 'parakou',
      'Tchaourou': 'tchaourou',
      'N\'Dali': 'ndali',
      'Nikki': 'nikki',
      'Bembèrèké': 'bembereke',
      'Kalalé': 'kalale',
      'Sinendé': 'sinende',
      'Pèrèrè': 'perere',
      'Village/Quartier': 'village_quartier',
      'Hameau': 'hameau',
      'Secteur/Domaine': 'secteur_domaine',
      'Type d\'infrastructure': 'type_infrastructure',
      'Nom de l\'infrastructure': 'nom_infrastructure',
      'Année de réalisation': 'annee_realisation',
      'Bailleur': 'bailleur',
      'Type de matériaux': 'type_materiaux',
      'État de fonctionnement': 'etat_fonctionnement',
      'Niveau de dégradation': 'niveau_degradation',
      'Mode de gestion': 'mode_gestion',
      'Précisé': 'precise',
      'Défectuosités relevées': 'defectuosites_relevees',
      'Mesures proposées': 'mesures_proposees',
      'Observation générale': 'observation_generale',
      'Réhabilitation': 'rehabilitation',
      'Localisation': 'localisation',
      'Latitude': 'latitude',
      'Longitude': 'longitude',
      'Altitude': 'altitude',
      'Précision GPS': 'precision_gps'
    };
  }

  static async processExcelFile(file, userId) {
    try {
      // Lire le fichier Excel
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convertir en JSON avec options pour ignorer les en-têtes vides
      const data = xlsx.utils.sheet_to_json(sheet, {
        header: 1, // Obtenir les données comme un tableau de tableaux
        defval: "", // Valeur par défaut pour les cellules vides
        blankrows: false // Ignorer les lignes vides
      });

      if (!data.length) {
        throw new Error("Le fichier est vide");
      }

      // Convertir le tableau de tableaux en objets avec les en-têtes
      const headers = data[0]; // Première ligne = en-têtes
      const rows = data.slice(1); // Reste = données
      
      // Filtrer les lignes qui ne sont pas des en-têtes
      const validRows = rows.filter(row => {
        // Vérifier que la ligne contient des données réelles et non des en-têtes
        return row.some(cell => cell && cell !== "" && !this.isHeaderValue(cell));
      });

      const jsonData = validRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          if (header && header.trim()) {
            obj[header.trim()] = row[index] || '';
          }
        });
        return obj;
      });

      console.log("📊 Données extraites :", jsonData.length, "lignes");

      if (jsonData.length === 0) {
        throw new Error("Aucune donnée valide trouvée dans le fichier");
      }

      // Créer un enregistrement d'importation
      const importRecord = await this.createImportRecord(file, userId, jsonData.length);

      // Traiter les données
      const result = await this.processData(jsonData, userId, importRecord.id);

      // Mettre à jour le statut d'importation
      await this.updateImportRecord(importRecord.id, result);

      // Nettoyer le fichier temporaire
      this.cleanupFile(file.path);

      return {
        importId: importRecord.id,
        totalImported: result.successCount,
        errors: result.errors
      };

    } catch (error) {
      console.error("Erreur lors du traitement du fichier:", error);
      throw error;
    }
  }

  // Fonction pour détecter si une valeur est un en-tête
  static isHeaderValue(value) {
    if (!value) return false;
    const strValue = String(value).toLowerCase().trim();
    const headerKeywords = [
      'nom de', 'niveau de', 'type de', 'état de', 'mode de',
      'année de', 'village/quartier', 'secteur/domaine',
      'défectuosités relevées', 'mesures proposées', 
      'observation générale', 'précision gps'
    ];
    
    return headerKeywords.some(keyword => strValue.includes(keyword));
  }

  static async createImportRecord(file, userId, totalLines) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO importations 
        (nom_fichier, taille_fichier, chemin_fichier, nombre_lignes_total, utilisateur_id, statut) 
        VALUES (?, ?, ?, ?, ?, 'en_cours')
      `;
      
      db.query(sql, [
        file.originalname,
        file.size,
        file.path,
        totalLines,
        userId
      ], (err, result) => {
        if (err) {
          console.error("Erreur création enregistrement import:", err);
          return reject(err);
        }
        resolve({ id: result.insertId });
      });
    });
  }

  static async processData(data, userId, importId) {
    const columnMapping = this.getColumnMapping();
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const mappedRow = this.mapRowToDatabase(row, columnMapping);
        
        // Validation des données avant insertion
        if (!this.validateRowData(mappedRow)) {
          throw new Error("Données invalides ou ligne d'en-tête détectée");
        }
        
        // Ajouter les métadonnées
        mappedRow.source_donnee = 'import';
        mappedRow.utilisateur_id = userId;
        mappedRow.statut_traitement = 'nouveau';

        await this.insertInfrastructure(mappedRow);
        successCount++;
        
      } catch (error) {
        console.error(`Erreur ligne ${i + 1}:`, error);
        errors.push({
          ligne: i + 1,
          erreur: error.message,
          donnees: data[i]
        });
      }
    }

    return { successCount, errors };
  }

  // Validation des données de ligne
  static validateRowData(mappedRow) {
    // Vérifier que ce n'est pas une ligne d'en-tête
    for (const [key, value] of Object.entries(mappedRow)) {
      if (value && this.isHeaderValue(value)) {
        return false;
      }
    }
    
    // Vérifier qu'il y a au moins quelques champs remplis
    const filledFields = Object.values(mappedRow).filter(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    return filledFields.length >= 3; // Au moins 3 champs doivent être remplis
  }

  static mapRowToDatabase(row, columnMapping) {
    const mappedRow = {};
    
    for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
      let value = row[excelColumn];
      
      // Traitement spécifique selon le type de colonne
      if (value !== undefined && value !== null && value !== '') {
        switch (dbColumn) {
          case 'date_enquete':
            mappedRow[dbColumn] = this.parseDate(value);
            break;
          case 'annee_realisation':
            mappedRow[dbColumn] = this.parseYear(value);
            break;
          case 'latitude':
          case 'longitude':
          case 'altitude':
          case 'precision_gps':
          case 'localisation':
            mappedRow[dbColumn] = this.parseFloat(value);
            break;
          case 'parakou':
          case 'tchaourou':
          case 'ndali':
          case 'nikki':
          case 'bembereke':
          case 'kalale':
          case 'sinende':
          case 'perere':
          case 'rehabilitation':
            mappedRow[dbColumn] = this.parseBoolean(value);
            break;
          case 'niveau_degradation':
          case 'etat_fonctionnement':
          case 'mode_gestion':
            // Limiter la longueur et nettoyer la valeur
            mappedRow[dbColumn] = this.cleanAndTruncateString(value, 50);
            break;
          default:
            // Limiter la longueur pour les autres champs texte
            mappedRow[dbColumn] = this.cleanAndTruncateString(value, 255);
        }
      }
    }
    
    return mappedRow;
  }

  // Nouvelle fonction pour nettoyer et tronquer les chaînes
  static cleanAndTruncateString(value, maxLength = 255) {
    if (!value) return null;
    
    let cleanValue = String(value).trim();
    
    // Supprimer les caractères de contrôle et les espaces multiples
    cleanValue = cleanValue.replace(/[\x00-\x1F\x7F]/g, '').replace(/\s+/g, ' ');
    
    // Tronquer si nécessaire
    if (cleanValue.length > maxLength) {
      cleanValue = cleanValue.substring(0, maxLength);
    }
    
    return cleanValue || null;
  }

  static parseDate(value) {
    if (!value) return null;
    try {
      // Gérer différents formats de date
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  static parseYear(value) {
    if (!value) return null;
    const year = parseInt(value);
    return (year >= 1900 && year <= new Date().getFullYear()) ? year : null;
  }

  static parseFloat(value) {
    if (!value) return null;
    const float = parseFloat(value);
    return isNaN(float) ? null : float;
  }

  static parseBoolean(value) {
    if (!value) return false;
    const str = String(value).toLowerCase().trim();
    return ['true', '1', 'oui', 'yes', 'vrai'].includes(str);
  }

  static async insertInfrastructure(data) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(',');
      const values = Object.values(data);
      
      const sql = `INSERT INTO infrastructures (${columns.join(',')}) VALUES (${placeholders})`;
      
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erreur insertion infrastructure:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static async updateImportRecord(importId, result) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE importations 
        SET nombre_lignes_importees = ?, 
            nombre_erreurs = ?, 
            statut = ?, 
            date_fin_importation = NOW(),
            rapport_erreurs = ?
        WHERE id = ?
      `;
      
      db.query(sql, [
        result.successCount,
        result.errors.length,
        result.errors.length > 0 ? 'termine' : 'termine',
        JSON.stringify(result.errors),
        importId
      ], (err) => {
        if (err) {
          console.error("Erreur mise à jour import:", err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("✅ Fichier temporaire supprimé:", filePath);
      }
    } catch (error) {
      console.error("Erreur suppression fichier:", error);
    }
  }
}

module.exports = ImportService;