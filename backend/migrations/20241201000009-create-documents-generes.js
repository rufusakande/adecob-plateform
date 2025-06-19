'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents_generes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom_document: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type_document: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      chemin_fichier: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      taille_fichier: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nombre_enregistrements: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      filtre_applique: {
        type: Sequelize.JSON,
        allowNull: true
      },
      date_generation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expire_le: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('genere', 'expire', 'supprime'),
        defaultValue: 'genere'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('documents_generes', ['utilisateur_id']);
    await queryInterface.addIndex('documents_generes', ['date_generation']);
    await queryInterface.addIndex('documents_generes', ['statut']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents_generes');
  }
};