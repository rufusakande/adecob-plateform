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
        allowNull: false
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
      name: 'idx_utilisateur'
    });

    await queryInterface.addIndex('sessions_utilisateur', ['refresh_token'], {
      name: 'idx_refresh_token'
    });

    await queryInterface.addIndex('sessions_utilisateur', ['expire_le'], {
      name: 'idx_expire_le'
    });
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les index avant de supprimer la table
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_utilisateur');
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_refresh_token');
    await queryInterface.removeIndex('sessions_utilisateur', 'idx_expire_le');
    
    // Supprimer la table
    await queryInterface.dropTable('sessions_utilisateur');
  }
};