'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('infrastructures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Informations d'enquête
      start: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      end: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      date_enquete: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nom_enqueteur: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      numero_enquete: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      
      // Localisation administrative
      commune: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parakou: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tchaourou: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ndali: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      nikki: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      bembereke: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      kalale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sinende: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      perere: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      
      // Localisation géographique détaillée
      village_quartier: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      hameau: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      secteur_domaine: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      
      // Informations sur l'infrastructure
      type_infrastructure: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      nom_infrastructure: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      annee_realisation: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bailleur: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      type_materiaux: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // État et gestion
      etat_fonctionnement: {
        type: Sequelize.ENUM('Bon', 'Moyen', 'Mauvais', 'Hors service', 'Non fonctionnel'),
        defaultValue: 'Bon'
      },
      niveau_degradation: {
        type: Sequelize.ENUM('Aucun', 'Faible', 'Moyen', 'Élevé', 'Très élevé'),
        defaultValue: 'Aucun'
      },
      mode_gestion: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      precise: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Observations et recommandations
      defectuosites_relevees: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mesures_proposees: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      observation_generale: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Photos et documents
      photo1_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      photo2_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      photo3_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      photo4_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      
      // Besoins de réhabilitation
      rehabilitation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      
      // Géolocalisation
      localisation: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      altitude: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      precision_gps: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      
      // Métadonnées de collecte
      external_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      uuid: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      submission_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      validation_status: {
        type: Sequelize.ENUM('draft', 'submitted', 'validated', 'rejected'),
        defaultValue: 'draft'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status_collecte: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      submitted_by: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      version_form: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      index_ordre: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      
      // Gestion interne
      statut_traitement: {
        type: Sequelize.ENUM('nouveau', 'en_cours', 'traite', 'valide'),
        defaultValue: 'nouveau'
      },
      source_donnee: {
        type: Sequelize.ENUM('import', 'saisie_manuelle'),
        allowNull: false
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      date_traitement: {
        type: Sequelize.DATE,
        allowNull: true
      },
      traite_par_utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      observations_internes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // Ajout des index
    await queryInterface.addIndex('infrastructures', ['statut_traitement']);
    await queryInterface.addIndex('infrastructures', ['commune']);
    await queryInterface.addIndex('infrastructures', ['type_infrastructure']);
    await queryInterface.addIndex('infrastructures', ['etat_fonctionnement']);
    await queryInterface.addIndex('infrastructures', ['utilisateur_id']);
    await queryInterface.addIndex('infrastructures', ['date_creation']);
    await queryInterface.addIndex('infrastructures', ['latitude', 'longitude']);
    await queryInterface.addIndex('infrastructures', ['uuid'], { unique: true });
    await queryInterface.addIndex('infrastructures', ['validation_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('infrastructures');
  }
};