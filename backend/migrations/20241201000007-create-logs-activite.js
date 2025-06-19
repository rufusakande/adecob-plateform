'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs_activite', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      table_concernee: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      id_enregistrement: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      donnees_avant: {
        type: Sequelize.JSON,
        allowNull: true
      },
      donnees_apres: {
        type: Sequelize.JSON,
        allowNull: true
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
      }
    });

    await queryInterface.addIndex('sessions_utilisateur', ['utilisateur_id']);
    await queryInterface.addIndex('sessions_utilisateur', ['refresh_token'], { 
      name: 'idx_refresh_token',
      length: { refresh_token: 255 } 
    });
    await queryInterface.addIndex('sessions_utilisateur', ['expire_le']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions_utilisateur');
  }
};