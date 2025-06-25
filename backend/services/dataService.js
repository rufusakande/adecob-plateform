const db = require("../config/db");

class DataService {

  // Méthode utilitaire pour exécuter les requêtes
  static executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }

  // Helper method to build location-based WHERE clause
  static buildLocationWhereClause(user, tableAlias = 'i') {
    let whereConditions = [];
    let params = [];

    if (user.role !== 'administrateur') {
      if (user.commune_id && user.commune_nom) {
        whereConditions.push(`LOWER(${tableAlias}.commune) = LOWER(?)`);
        params.push(user.commune_nom);
      } else {
        // If no commune assigned, no data visible
        whereConditions.push('1 = 0');
      }
    }

    return { whereConditions, params };
  }

  static async getInfrastructures(options, user) {
    const { page, limit, search, sortBy, sortDirection, commune, statut_traitement, etat_fonctionnement, type_infrastructure } = options;
    const offset = (page - 1) * limit;

    // Colonnes autorisées pour le tri (sécurité)
    const safeColumns = [
      "id", "commune", "village_quartier", "type_infrastructure",
      "nom_infrastructure", "etat_fonctionnement", "niveau_degradation",
      "annee_realisation", "bailleur", "statut_traitement", "date_creation"
    ];
    const safeSortBy = safeColumns.includes(sortBy) ? sortBy : 'id';

    // Build WHERE clause
    const { whereConditions, params } = this.buildLocationWhereClause(user, 'i');

    // Add filters
    if (search) {
      whereConditions.push(`(\n        i.nom_infrastructure LIKE ? OR \n        i.commune LIKE ? OR \n        i.village_quartier LIKE ? OR \n        i.type_infrastructure LIKE ? OR\n        i.bailleur LIKE ?\n      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (commune) {
      whereConditions.push('i.commune = ?');
      params.push(commune);
    }

    if (statut_traitement) {
      whereConditions.push('i.statut_traitement = ?');
      params.push(statut_traitement);
    }

    if (etat_fonctionnement) {
      whereConditions.push('i.etat_fonctionnement = ?');
      params.push(etat_fonctionnement);
    }

    if (type_infrastructure) {
      whereConditions.push('i.type_infrastructure = ?');
      params.push(type_infrastructure);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM infrastructures i
      LEFT JOIN communes c ON LOWER(i.commune) = LOWER(c.nom)
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT
        i.id,
        i.commune,
        i.village_quartier,
        i.secteur_domaine,
        i.type_infrastructure,
        i.nom_infrastructure,
        i.annee_realisation,
        i.bailleur,
        i.etat_fonctionnement,
        i.niveau_degradation,
        i.statut_traitement,
        i.source_donnee,
        i.latitude,
        i.longitude,
        i.date_creation,
        i.date_traitement,
        u.nom as createur_nom,
        u.prenom as createur_prenom
      FROM infrastructures i
      LEFT JOIN communes c ON LOWER(i.commune) = LOWER(c.nom)
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${sortDirection === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `;

    try {
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
      console.error("Erreur dans getInfrastructures:", error);
      throw error;
    }
  }

  static async getInfrastructureById(id, user) {
    const query = `
      SELECT
        i.*,
        u.nom as createur_nom,
        u.prenom as createur_prenom,
        ut.nom as traiteur_nom,
        ut.prenom as traiteur_prenom
      FROM infrastructures i
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      LEFT JOIN utilisateurs ut ON i.traite_par_utilisateur_id = ut.id
      WHERE i.id = ?
    `;

    try {
      const result = await this.executeQuery(query, [id]);

      if (result.length === 0) {
        return null;
      }

      const infrastructure = result[0];

      // Contrôle d\'accès
      if (user.role !== 'administrateur') {
        // Vérifier si l\'utilisateur a accès à cette commune en utilisant user.commune_nom
        if (!user.commune_nom || infrastructure.commune.toLowerCase() !== user.commune_nom.toLowerCase()) {
             throw new Error("Accès non autorisé à cette infrastructure");
        }
      }

      return infrastructure;
    } catch (error) {
      console.error("Erreur dans getInfrastructureById:", error);
      throw error;
    }
  }

  static async updateInfrastructure(id, updateData, user) {
    try {
      // Vérifier l\'accès
      const infrastructure = await this.getInfrastructureById(id, user);
      if (!infrastructure) {
        // getInfrastructureById throws error if not found or not authorized
        return null;
      }

      // Préparer les données de mise à jour
      const allowedFields = [
        'commune', 'village_quartier', 'secteur_domaine', 'type_infrastructure',
        'nom_infrastructure', 'annee_realisation', 'bailleur', 'type_materiaux',
        'etat_fonctionnement', 'niveau_degradation', 'mode_gestion', 'precise',
        'defectuosites_relevees', 'mesures_proposees', 'observation_generale',
        'latitude', 'longitude', 'altitude', 'precision_gps', 'observations_internes'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData.hasOwnProperty(field)) {
          updates[field] = updateData[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("Aucune donnée à mettre à jour");
      }

      // Construire la requête de mise à jour
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);

      const query = `UPDATE infrastructures SET ${setClause}, updated_at = NOW() WHERE id = ?`;

      await this.executeQuery(query, values);

      // Re-fetch the infrastructure to return the updated data with access check
      return await this.getInfrastructureById(id, user);
    } catch (error) {
      console.error("Erreur dans updateInfrastructure:", error);
      throw error;
    }
  }

  static async deleteInfrastructure(id, user) {
    try {
      // Vérifier l\'accès
      const infrastructure = await this.getInfrastructureById(id, user);
      if (!infrastructure) {
         // getInfrastructureById throws error if not found or not authorized
        return null;
      }

      const query = 'DELETE FROM infrastructures WHERE id = ?';
      await this.executeQuery(query, [id]);

      return { success: true };
    } catch (error) {
      console.error("Erreur dans deleteInfrastructure:", error);
      throw error;
    }
  }

  static async deleteAllInfrastructures(user) {
     // Add admin check
    if (user.role !== 'administrateur') {
      throw new Error("Accès non autorisé. Droits administrateur requis.");
    }
    try {
      const countQuery = 'SELECT COUNT(*) as total FROM infrastructures';
      const countResult = await this.executeQuery(countQuery);
      const totalCount = countResult[0].total;

      const deleteQuery = 'DELETE FROM infrastructures';
      await this.executeQuery(deleteQuery);

      return { deletedCount: totalCount };
    } catch (error) {
      console.error("Erreur dans deleteAllInfrastructures:", error);
      throw error;
    }
  }

  static async processInfrastructure(id, observations, user) {
    try {
      // Vérifier l\'accès
      const infrastructure = await this.getInfrastructureById(id, user);
      if (!infrastructure) {
        // getInfrastructureById throws error if not found or not authorized
        return null;
      }

      const query = `
        UPDATE infrastructures
        SET statut_traitement = 'traite',
            date_traitement = NOW(),
            traite_par_utilisateur_id = ?,
            observations_internes = ?
        WHERE id = ?
      `;

      await this.executeQuery(query, [user.id, observations || '', id]);

      return await this.getInfrastructureById(id, user);
    } catch (error) {
      console.error("Erreur dans processInfrastructure:", error);
      throw error;
    }
  }

  static async getGeneralStats(user) {
    try {
      const { whereConditions, params } = this.buildLocationWhereClause(user);

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const queries = {
        total: `SELECT COUNT(*) as count FROM infrastructures ${whereClause}`,
        bon_etat: `SELECT COUNT(*) as count FROM infrastructures ${whereClause} ${whereClause ? 'AND' : 'WHERE'} etat_fonctionnement = 'Bon'`,
        mauvais_etat: `SELECT COUNT(*) as count FROM infrastructures ${whereClause} ${whereClause ? 'AND' : 'WHERE'} etat_fonctionnement IN ('Mauvais', 'Hors service')`,
        non_traites: `SELECT COUNT(*) as count FROM infrastructures ${whereClause} ${whereClause ? 'AND' : 'WHERE'} statut_traitement = 'nouveau'`,
        traites: `SELECT COUNT(*) as count FROM infrastructures ${whereClause} ${whereClause ? 'AND' : 'WHERE'} statut_traitement = 'traite'`
      };

      const results = {};
      for (const [key, query] of Object.entries(queries)) {
        const result = await this.executeQuery(query, params);
        results[key] = result[0].count;
      }

      return results;
    } catch (error) {
      console.error("Erreur dans getGeneralStats:", error);
      throw error;
    }
  }

  static async getStatsByCommune(user) {
    try {
       const { whereConditions, params } = this.buildLocationWhereClause(user);

       const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT
          commune,
          COUNT(*) as total,
          COUNT(CASE WHEN etat_fonctionnement = 'Bon' THEN 1 END) as bon_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Moyen' THEN 1 END) as moyen_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Mauvais' THEN 1 END) as mauvais_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Hors service' THEN 1 END) as hors_service,
          COUNT(CASE WHEN statut_traitement = 'nouveau' THEN 1 END) as non_traites,
          COUNT(CASE WHEN statut_traitement = 'traite' THEN 1 END) as traites
        FROM infrastructures
        ${whereClause}
        GROUP BY commune
        ORDER BY commune
      `;

      const result = await this.executeQuery(query, params);
      return result;
    } catch (error) {
      console.error("Erreur dans getStatsByCommune:", error);
      throw error;
    }
  }

  static async getAllowedCommunes(user) {
    try {
      let query;
      let params = [];

      if (user.role === 'administrateur') {
        // Les administrateurs voient toutes les communes
        query = `
          SELECT DISTINCT commune
          FROM infrastructures
          WHERE commune IS NOT NULL AND commune != ''
          ORDER BY commune
        `;
      } else if (user.commune_nom) {
        // Les membres voient seulement leur commune
         query = `
            SELECT DISTINCT commune
            FROM infrastructures
            WHERE LOWER(commune) = LOWER(?)
            ORDER BY commune
          `;
          params.push(user.commune_nom);
      } else {
        return [];
      }

      const result = await this.executeQuery(query, params);
      return result.map(row => row.commune);
    } catch (error) {
      console.error("Erreur dans getAllowedCommunes:", error);
      throw error;
    }
  }

  static async getStatsByType(user) {
    try {
       const { whereConditions, params } = this.buildLocationWhereClause(user);

       const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT
          type_infrastructure,
          COUNT(*) as total,
          COUNT(CASE WHEN etat_fonctionnement = 'Bon' THEN 1 END) as bon_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Moyen' THEN 1 END) as moyen_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Mauvais' THEN 1 END) as mauvais_etat,
          COUNT(CASE WHEN etat_fonctionnement = 'Hors service' THEN 1 END) as hors_service
        FROM infrastructures
        ${whereClause}
        GROUP BY type_infrastructure
        ORDER BY total DESC
      `;

      const result = await this.executeQuery(query, params);
      return result;
    } catch (error) {
      console.error("Erreur dans getStatsByType:", error);
      throw error;
    }
  }

  static async createInfrastructure(infrastructureData, user) {
    try {
      // Contrôle d\'accès - vérifier si l\'utilisateur peut créer dans cette commune
      if (user.role !== 'administrateur') {
        if (!user.commune_nom || infrastructureData.commune.toLowerCase() !== user.commune_nom.toLowerCase()) {
          throw new Error("Vous ne pouvez créer des infrastructures que dans votre commune");
        }
      }

      // Préparer les données
      const allowedFields = [
        'commune', 'village_quartier', 'secteur_domaine', 'type_infrastructure',
        'nom_infrastructure', 'annee_realisation', 'bailleur', 'type_materiaux',
        'etat_fonctionnement', 'niveau_degradation', 'mode_gestion', 'precise',
        'defectuosites_relevees', 'mesures_proposees', 'observation_generale',
        'latitude', 'longitude', 'altitude', 'precision_gps'
      ];

      const data = {};
      for (const field of allowedFields) {
        if (infrastructureData.hasOwnProperty(field)) {
          data[field] = infrastructureData[field];
        }
      }

      // Ajouter les métadonnées
      data.source_donnee = 'saisie_manuelle';
      data.utilisateur_id = user.id;
      data.statut_traitement = 'nouveau';

      // Construire la requête d\'insertion
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(',');
      const values = Object.values(data);

      const query = `INSERT INTO infrastructures (${columns.join(',')}) VALUES (${placeholders})`;

      const result = await this.executeQuery(query, values);

      return await this.getInfrastructureById(result.insertId, user);
    } catch (error) {
      console.error("Erreur dans createInfrastructure:", error);
      throw error;
    }
  }

  static async getInfrastructuresForExport(filters, user) {
    try {
      const { whereConditions, params } = this.buildLocationWhereClause(user);

      // Add filters
      if (filters.commune) {
        whereConditions.push('commune = ?');
        params.push(filters.commune);
      }

      if (filters.statut_traitement) {
        whereConditions.push('statut_traitement = ?');
        params.push(filters.statut_traitement);
      }

      if (filters.etat_fonctionnement) {
        whereConditions.push('etat_fonctionnement = ?');
        params.push(filters.etat_fonctionnement);
      }

      if (filters.type_infrastructure) {
        whereConditions.push('type_infrastructure = ?');
        params.push(filters.type_infrastructure);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT
          i.*,
          u.nom as createur_nom,
          u.prenom as createur_prenom,
          ut.nom as traiteur_nom,
          ut.prenom as traiteur_prenom
        FROM infrastructures i
        LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
        LEFT JOIN utilisateurs ut ON i.traite_par_utilisateur_id = ut.id
        ${whereClause}
        ORDER BY i.commune, i.type_infrastructure, i.nom_infrastructure
      `;

      const result = await this.executeQuery(query, params);
      return result;
    } catch (error) {
      console.error("Erreur dans getInfrastructuresForExport:", error);
      throw error;
    }
  }

// Méthode pour récupérer les infrastructures par IDs
static async getInfrastructuresByIds(ids, user) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    // Convertir les IDs en entiers et les valider
    const validIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));

    if (validIds.length === 0) {
      return [];
    }

    // Create placeholders for the IN clause
    const placeholders = validIds.map(() => '?').join(',');

    const { whereConditions, params } = this.buildLocationWhereClause(user, 'i');

    // Add the IN clause to the conditions
    whereConditions.push(`i.id IN (${placeholders})`);
    params.push(...validIds);


    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT
        i.id,
        i.commune,
        i.village_quartier,
        i.secteur_domaine,
        i.type_infrastructure,
        i.nom_infrastructure,
        i.annee_realisation,
        i.bailleur,
        i.etat_fonctionnement,
        i.niveau_degradation,
        i.statut_traitement,
        i.source_donnee,
        i.latitude,
        i.longitude,
        i.date_creation,
        i.date_traitement,
        i.defectuosites_relevees,
        i.mesures_proposees,
        i.observation_generale,
        i.mode_gestion,
        i.type_materiaux,
        i.precise,
        i.altitude,
        i.precision_gps,
        i.observations_internes,
        u.nom as createur_nom,
        u.prenom as createur_prenom,
        ut.nom as traiteur_nom,
        ut.prenom as traiteur_prenom
      FROM infrastructures i
      LEFT JOIN communes c ON LOWER(i.commune) = LOWER(c.nom)
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      LEFT JOIN utilisateurs ut ON i.traite_par_utilisateur_id = ut.id
      ${whereClause}
      ORDER BY i.commune, i.type_infrastructure, i.nom_infrastructure
    `;

    const result = await this.executeQuery(query, params);
    return result;

  } catch (error) {
    console.error("Erreur dans getInfrastructuresByIds:", error);
    throw error;
  }
}
}

module.exports = DataService;
