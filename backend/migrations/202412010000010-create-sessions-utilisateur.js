'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions_utilisateur', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      refresh_token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true // Ajout pour éviter les doublons
      },
      expire_le: {
        type: Sequelize.DATE,
        allowNull: false
      },
      adresse_ip: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Ajout des index pour optimiser les performances
    await queryInterface.addIndex('sessions_utilisateur', ['utilisateur_id'], {
      name: 'idx_sessions_utilisateur_id'
    });

    await queryInterface.addIndex('sessions_utilisateur', ['refresh_token'], {
      name: 'idx_sessions_refresh_token'
    });

    await queryInterface.addIndex('sessions_utilisateur', ['expire_le'], {
      name: 'idx_sessions_expire_le'
    });

    // Index composé pour les requêtes de nettoyage
    await queryInterface.addIndex('sessions_utilisateur', ['expire_le', 'utilisateur_id'], {
      name: 'idx_sessions_expire_user'
    });
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les index avant de supprimer la table
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_sessions_utilisateur_id');
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_sessions_refresh_token');
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_sessions_expire_le');
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_sessions_expire_user');
    
    // Supprimer la table
    await queryInterface.dropTable('sessions_utilisateur');
  }
};