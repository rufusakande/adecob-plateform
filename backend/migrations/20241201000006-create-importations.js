'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('importations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom_fichier: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      taille_fichier: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      chemin_fichier: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      nombre_lignes_total: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      nombre_lignes_importees: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      nombre_erreurs: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      statut: {
        type: Sequelize.ENUM('en_cours', 'termine', 'erreur'),
        defaultValue: 'en_cours'
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
      date_importation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      date_fin_importation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rapport_erreurs: {
        type: Sequelize.JSON,
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
    });

    await queryInterface.addIndex('importations', ['utilisateur_id']);
    await queryInterface.addIndex('importations', ['date_importation']);
    await queryInterface.addIndex('importations', ['statut']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('importations');
  }
};