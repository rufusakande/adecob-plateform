'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('utilisateurs', [{
      nom: 'Admin',
      prenom: 'ADECOB',
      email: 'admin2@adecob.org',
      telephone: '+229 XX XX XX XX',
      mot_de_passe: hashedPassword,
      role: 'administrateur',
      departement_id: 2, // Borgou
      commune_id: 1, // Parakou
      statut: 'actif',
      date_inscription: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('utilisateurs', {
      email: 'admin2@adecob.org'
    }, {});
  }
};