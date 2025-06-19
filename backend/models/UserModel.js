const db = require("../config/db");

class User {
  // Méthode utilitaire pour exécuter les requêtes avec gestion d'erreur
  static executeQuery(sql, params, callback) {
    // Vérifier si le pool est disponible
    if (!db || db.pool?.destroyed) {
      return callback(new Error('Pool de base de données non disponible'));
    }

    db.query(sql, params, (error, results) => {
      if (error) {
        console.error('Erreur SQL:', error);
        // Si c'est une erreur de connexion, essayer de se reconnecter
        if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
            error.code === 'ECONNRESET' || 
            error.fatal) {
          console.log('Tentative de reconnexion...');
          setTimeout(() => {
            db.query(sql, params, callback);
          }, 1000);
          return;
        }
      }
      callback(error, results);
    });
  }

  // Créer un nouvel utilisateur
  static create(userData, callback) {
    const {
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe,
      role = 'membre',
      departement_id,
      commune_id
    } = userData;

    const sql = `
      INSERT INTO utilisateurs 
      (nom, prenom, email, telephone, mot_de_passe, role, departement_id, commune_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    this.executeQuery(sql, [nom, prenom, email, telephone, mot_de_passe, role, departement_id, commune_id], callback);
  }

  // Trouver un utilisateur par email
  static findByEmail(email, callback) {
    const sql = `
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.telephone, u.mot_de_passe, 
        u.role, u.statut, u.date_inscription, u.derniere_connexion,
        u.departement_id, u.commune_id,
        d.nom as departement_nom, d.code as departement_code,
        c.nom as commune_nom, c.code as commune_code
      FROM utilisateurs u
      LEFT JOIN departements d ON u.departement_id = d.id
      LEFT JOIN communes c ON u.commune_id = c.id
      WHERE u.email = ? AND u.statut = 'actif'
    `;
    
    this.executeQuery(sql, [email], callback);
  }

  // Trouver un utilisateur par ID
  static findById(id, callback) {
    const sql = `
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.telephone, 
        u.role, u.statut, u.date_inscription, u.derniere_connexion,
        u.departement_id, u.commune_id,
        d.nom as departement_nom, d.code as departement_code,
        c.nom as commune_nom, c.code as commune_code
      FROM utilisateurs u
      LEFT JOIN departements d ON u.departement_id = d.id
      LEFT JOIN communes c ON u.commune_id = c.id
      WHERE u.id = ? AND u.statut = 'actif'
    `;
    
    this.executeQuery(sql, [id], callback);
  }

  // Mettre à jour la dernière connexion
  static updateLastLogin(id, callback) {
    const sql = "UPDATE utilisateurs SET derniere_connexion = CURRENT_TIMESTAMP WHERE id = ?";
    this.executeQuery(sql, [id], callback);
  }

  // Vérifier si un email existe déjà
  static checkEmailExists(email, callback) {
    const sql = "SELECT id FROM utilisateurs WHERE email = ?";
    this.executeQuery(sql, [email], callback);
  }

  // Obtenir tous les départements
  static getDepartements(callback) {
    const sql = "SELECT id, nom, code FROM departements ORDER BY nom";
    this.executeQuery(sql, [], callback);
  }

  // Obtenir les communes d'un département
  static getCommunesByDepartement(departement_id, callback) {
    const sql = `
      SELECT id, nom, code 
      FROM communes 
      WHERE departement_id = ? 
      ORDER BY nom
    `;
    this.executeQuery(sql, [departement_id], callback);
  }

  // Obtenir toutes les communes
  static getAllCommunes(callback) {
    const sql = `
      SELECT c.id, c.nom, c.code, c.departement_id, d.nom as departement_nom
      FROM communes c
      LEFT JOIN departements d ON c.departement_id = d.id
      ORDER BY d.nom, c.nom
    `;
    this.executeQuery(sql, [], callback);
  }

  // Créer une session de refresh token
  static createSession(sessionData, callback) {
    const { utilisateur_id, refresh_token, expire_le, adresse_ip, user_agent } = sessionData;
    const sql = `
      INSERT INTO sessions_utilisateur 
      (utilisateur_id, refresh_token, expire_le, adresse_ip, user_agent) 
      VALUES (?, ?, ?, ?, ?)
    `;
    this.executeQuery(sql, [utilisateur_id, refresh_token, expire_le, adresse_ip, user_agent], callback);
  }

  // Trouver une session par refresh token
  static findSessionByToken(refresh_token, callback) {
    const sql = `
      SELECT s.*, u.id as user_id, u.email, u.statut
      FROM sessions_utilisateur s
      JOIN utilisateurs u ON s.utilisateur_id = u.id
      WHERE s.refresh_token = ? AND s.expire_le > NOW() AND u.statut = 'actif'
    `;
    this.executeQuery(sql, [refresh_token], callback);
  }

  // Supprimer une session
  static deleteSession(refresh_token, callback) {
    const sql = "DELETE FROM sessions_utilisateur WHERE refresh_token = ?";
    this.executeQuery(sql, [refresh_token], callback);
  }

  // Supprimer toutes les sessions expirées avec gestion d'erreur améliorée
  static cleanExpiredSessions(callback) {
    const sql = "DELETE FROM sessions_utilisateur WHERE expire_le < NOW()";
    
    // Vérifier si le pool est disponible avant d'exécuter
    if (!db || db.pool?.destroyed) {
      console.warn('Pool de base de données non disponible pour le nettoyage des sessions');
      if (callback) callback(new Error('Pool non disponible'));
      return;
    }

    this.executeQuery(sql, [], (error, results) => {
      if (error) {
        console.error('Erreur lors du nettoyage des sessions:', error);
      } else {
        console.log(`${results.affectedRows || 0} sessions expirées supprimées`);
      }
      if (callback) callback(error, results);
    });
  }

  // Enregistrer un log d'activité
  static logActivity(logData, callback) {
    const {
      utilisateur_id,
      action,
      description,
      table_concernee,
      id_enregistrement,
      donnees_avant,
      donnees_apres,
      adresse_ip,
      user_agent
    } = logData;

    const sql = `
      INSERT INTO logs_activite 
      (utilisateur_id, action, description, table_concernee, id_enregistrement, 
       donnees_avant, donnees_apres, adresse_ip, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.executeQuery(sql, [
      utilisateur_id,
      action,
      description,
      table_concernee,
      id_enregistrement,
      donnees_avant ? JSON.stringify(donnees_avant) : null,
      donnees_apres ? JSON.stringify(donnees_apres) : null,
      adresse_ip,
      user_agent
    ], callback);
  }

  // Méthode pour vérifier la santé de la base de données
  static checkHealth(callback) {
    const sql = "SELECT 1 as health_check";
    this.executeQuery(sql, [], callback);
  }
}

module.exports = User;