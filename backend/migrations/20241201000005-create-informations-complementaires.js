'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('informations_complementaires', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      infrastructure_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'infrastructures',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type_information: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      libelle: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      valeur: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_ajout: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ajoute_par_utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('informations_complementaires', ['infrastructure_id']);
    await queryInterface.addIndex('informations_complementaires', ['type_information']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('informations_complementaires');
  }
};