'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('utilisateurs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('administrateur', 'membre'),
        defaultValue: 'membre'
      },
      departement_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      commune_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'communes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      statut: {
        type: Sequelize.ENUM('actif', 'inactif', 'suspendu'),
        defaultValue: 'actif'
      },
      date_inscription: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      derniere_connexion: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('utilisateurs', ['email'], {
      name: 'idx_email',
      unique: true
    });
    await queryInterface.addIndex('utilisateurs', ['role'], {
      name: 'idx_role'
    });
    await queryInterface.addIndex('utilisateurs', ['departement_id', 'commune_id'], {
      name: 'idx_departement_commune'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('utilisateurs');
  }
};