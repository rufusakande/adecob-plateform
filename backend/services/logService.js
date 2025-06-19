const db = require("../config/db");

class LogService {
  
  // Méthode utilitaire pour exécuter les requêtes
  static async executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Enregistrer une activité utilisateur
  static async logActivity(userId, action, description, tableConcernee = null, idEnregistrement = null, adresseIp = null, userAgent = null, donneesAvant = null, donneesApres = null) {
    try {
      const query = `
        INSERT INTO logs_activite 
        (utilisateur_id, action, description, table_concernee, id_enregistrement, adresse_ip, user_agent, donnees_avant, donnees_apres) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        userId,
        action,
        description,
        tableConcernee,
        idEnregistrement,
        adresseIp,
        userAgent,
        donneesAvant ? JSON.stringify(donneesAvant) : null,
        donneesApres ? JSON.stringify(donneesApres) : null
      ];

      await this.executeQuery(query, params);
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du log:", error);
      // Ne pas faire échouer l'opération principale si le log échoue
    }
  }

  // Récupérer les logs avec pagination et filtres
  static async getLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        userId = null,
        action = null,
        tableConcernee = null,
        dateDebut = null,
        dateFin = null,
        sortBy = 'date_action',
        sortDirection = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      
      // Colonnes autorisées pour le tri
      const safeColumns = ['date_action', 'action', 'utilisateur_id', 'table_concernee'];
      const safeSortBy = safeColumns.includes(sortBy) ? sortBy : 'date_action';

      // Construction des conditions WHERE
      let whereConditions = [];
      let params = [];

      if (userId) {
        whereConditions.push('l.utilisateur_id = ?');
        params.push(userId);
      }

      if (action) {
        whereConditions.push('l.action = ?');
        params.push(action);
      }

      if (tableConcernee) {
        whereConditions.push('l.table_concernee = ?');
        params.push(tableConcernee);
      }

      if (dateDebut) {
        whereConditions.push('DATE(l.date_action) >= ?');
        params.push(dateDebut);
      }

      if (dateFin) {
        whereConditions.push('DATE(l.date_action) <= ?');
        params.push(dateFin);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Requête de comptage
      const countQuery = `
        SELECT COUNT(*) as total
        FROM logs_activite l
        ${whereClause}
      `;

      // Requête de données
      const dataQuery = `
        SELECT 
          l.id,
          l.action,
          l.description,
          l.table_concernee,
          l.id_enregistrement,
          l.adresse_ip,
          l.date_action,
          u.nom as utilisateur_nom,
          u.prenom as utilisateur_prenom,
          u.email as utilisateur_email
        FROM logs_activite l
        LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
        ${whereClause}
        ORDER BY l.${safeSortBy} ${sortDirection === 'desc' ? 'DESC' : 'ASC'}
        LIMIT ? OFFSET ?
      `;

      // Exécuter les requêtes
      const [countResult, dataResult] = await Promise.all([
        this.executeQuery(countQuery, params),
        this.executeQuery(dataQuery, [...params, limit, offset])
      ]);

      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: dataResult,
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      };

    } catch (error) {
      console.error("Erreur dans getLogs:", error);
      throw error;
    }
  }

  // Récupérer un log spécifique avec détails complets
  static async getLogById(id) {
    try {
      const query = `
        SELECT 
          l.*,
          u.nom as utilisateur_nom,
          u.prenom as utilisateur_prenom,
          u.email as utilisateur_email
        FROM logs_activite l
        LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
        WHERE l.id = ?
      `;

      const result = await this.executeQuery(query, [id]);
      
      if (result.length === 0) {
        return null;
      }

      const log = result[0];
      
      // Parser les données JSON
      if (log.donnees_avant) {
        try {
          log.donnees_avant = JSON.parse(log.donnees_avant);
        } catch (e) {
          log.donnees_avant = null;
        }
      }

      if (log.donnees_apres) {
        try {
          log.donnees_apres = JSON.parse(log.donnees_apres);
        } catch (e) {
          log.donnees_apres = null;
        }
      }

      return log;
    } catch (error) {
      console.error("Erreur dans getLogById:", error);
      throw error;
    }
  }

  // Obtenir les statistiques d'activité
  static async getActivityStats(periode = '30') {
    try {
      const query = `
        SELECT 
          action,
          COUNT(*) as nombre_actions,
          DATE(date_action) as date_action
        FROM logs_activite 
        WHERE date_action >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY action, DATE(date_action)
        ORDER BY date_action DESC, nombre_actions DESC
      `;

      const result = await this.executeQuery(query, [parseInt(periode)]);
      return result;
    } catch (error) {
      console.error("Erreur dans getActivityStats:", error);
      throw error;
    }
  }

  // Obtenir les actions les plus fréquentes
  static async getTopActions(limit = 10) {
    try {
      const query = `
        SELECT 
          action,
          COUNT(*) as nombre_total,
          COUNT(DISTINCT utilisateur_id) as nombre_utilisateurs,
          MAX(date_action) as derniere_action
        FROM logs_activite 
        GROUP BY action
        ORDER BY nombre_total DESC
        LIMIT ?
      `;

      const result = await this.executeQuery(query, [limit]);
      return result;
    } catch (error) {
      console.error("Erreur dans getTopActions:", error);
      throw error;
    }
  }

  // Obtenir l'activité par utilisateur
  static async getUserActivity(userId, limite = 50) {
    try {
      const query = `
        SELECT 
          action,
          description,
          table_concernee,
          id_enregistrement,
          adresse_ip,
          date_action
        FROM logs_activite 
        WHERE utilisateur_id = ?
        ORDER BY date_action DESC
        LIMIT ?
      `;

      const result = await this.executeQuery(query, [userId, limite]);
      return result;
    } catch (error) {
      console.error("Erreur dans getUserActivity:", error);
      throw error;
    }
  }

  // Nettoyer les anciens logs (pour maintenance)
  static async cleanOldLogs(joursAConserver = 90) {
    try {
      const query = `
        DELETE FROM logs_activite 
        WHERE date_action < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;

      const result = await this.executeQuery(query, [joursAConserver]);
      
      return {
        success: true,
        deletedCount: result.affectedRows
      };
    } catch (error) {
      console.error("Erreur dans cleanOldLogs:", error);
      throw error;
    }
  }

  // Obtenir les connexions récentes
  static async getRecentLogins(limit = 20) {
    try {
      const query = `
        SELECT 
          l.utilisateur_id,
          l.adresse_ip,
          l.date_action,
          u.nom,
          u.prenom,
          u.email
        FROM logs_activite l
        LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
        WHERE l.action IN ('login', 'connexion', 'authentification')
        ORDER BY l.date_action DESC
        LIMIT ?
      `;

      const result = await this.executeQuery(query, [limit]);
      return result;
    } catch (error) {
      console.error("Erreur dans getRecentLogins:", error);
      throw error;
    }
  }

  // Obtenir les statistiques globales des logs
  static async getGlobalStats() {
    try {
      const queries = {
        totalLogs: "SELECT COUNT(*) as total FROM logs_activite",
        totalUsers: "SELECT COUNT(DISTINCT utilisateur_id) as total FROM logs_activite WHERE utilisateur_id IS NOT NULL",
        todayLogs: "SELECT COUNT(*) as total FROM logs_activite WHERE DATE(date_action) = CURDATE()",
        thisWeekLogs: "SELECT COUNT(*) as total FROM logs_activite WHERE date_action >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
        thisMonthLogs: "SELECT COUNT(*) as total FROM logs_activite WHERE date_action >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
      };

      const results = await Promise.all(
        Object.values(queries).map(query => this.executeQuery(query))
      );

      return {
        totalLogs: results[0][0].total,
        totalUsers: results[1][0].total,
        todayLogs: results[2][0].total,
        thisWeekLogs: results[3][0].total,
        thisMonthLogs: results[4][0].total
      };
    } catch (error) {
      console.error("Erreur dans getGlobalStats:", error);
      throw error;
    }
  }

  // Obtenir les erreurs récentes (logs avec action contenant 'error' ou 'erreur')
  static async getRecentErrors(limit = 20) {
    try {
      const query = `
        SELECT 
          l.*,
          u.nom as utilisateur_nom,
          u.prenom as utilisateur_prenom,
          u.email as utilisateur_email
        FROM logs_activite l
        LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
        WHERE l.action LIKE '%error%' OR l.action LIKE '%erreur%' OR l.description LIKE '%erreur%'
        ORDER BY l.date_action DESC
        LIMIT ?
      `;

      const result = await this.executeQuery(query, [limit]);
      return result;
    } catch (error) {
      console.error("Erreur dans getRecentErrors:", error);
      throw error;
    }
  }

  // Exporter les logs vers CSV (pour les administrateurs)
  static async exportLogsToCSV(options = {}) {
    try {
      const {
        userId = null,
        action = null,
        dateDebut = null,
        dateFin = null,
        limit = 10000
      } = options;

      let whereConditions = [];
      let params = [];

      if (userId) {
        whereConditions.push('l.utilisateur_id = ?');
        params.push(userId);
      }

      if (action) {
        whereConditions.push('l.action = ?');
        params.push(action);
      }

      if (dateDebut) {
        whereConditions.push('DATE(l.date_action) >= ?');
        params.push(dateDebut);
      }

      if (dateFin) {
        whereConditions.push('DATE(l.date_action) <= ?');
        params.push(dateFin);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          l.id,
          l.action,
          l.description,
          l.table_concernee,
          l.id_enregistrement,
          l.adresse_ip,
          l.date_action,
          CONCAT(u.prenom, ' ', u.nom) as utilisateur,
          u.email as utilisateur_email
        FROM logs_activite l
        LEFT JOIN utilisateurs u ON l.utilisateur_id = u.id
        ${whereClause}
        ORDER BY l.date_action DESC
        LIMIT ?
      `;

      const result = await this.executeQuery(query, [...params, limit]);
      return result;
    } catch (error) {
      console.error("Erreur dans exportLogsToCSV:", error);
      throw error;
    }
  }

  // Méthode pour logger spécifiquement les tentatives de connexion
  static async logLogin(userId, success, adresseIp, userAgent, details = null) {
    try {
      const action = success ? 'login_success' : 'login_failed';
      const description = success 
        ? 'Connexion réussie' 
        : `Tentative de connexion échouée${details ? ': ' + details : ''}`;

      await this.logActivity(
        userId,
        action,
        description,
        'utilisateurs',
        userId,
        adresseIp,
        userAgent
      );
    } catch (error) {
      console.error("Erreur lors du log de connexion:", error);
    }
  }

  // Méthode pour logger les modifications de données avec comparaison avant/après
  static async logDataChange(userId, action, description, tableConcernee, idEnregistrement, donneesAvant, donneesApres, adresseIp, userAgent) {
    try {
      await this.logActivity(
        userId,
        action,
        description,
        tableConcernee,
        idEnregistrement,
        adresseIp,
        userAgent,
        donneesAvant,
        donneesApres
      );
    } catch (error) {
      console.error("Erreur lors du log de modification:", error);
    }
  }
}

module.exports = LogService;