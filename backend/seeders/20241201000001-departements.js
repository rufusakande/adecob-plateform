'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('departements', [
      { nom: 'Alibori', code: 'AL', created_at: new Date(), updated_at: new Date() },
      { nom: 'Atacora', code: 'AT', created_at: new Date(), updated_at: new Date() },
      { nom: 'Atlantique', code: 'AQ', created_at: new Date(), updated_at: new Date() },
      { nom: 'Borgou', code: 'BO', created_at: new Date(), updated_at: new Date() },
      { nom: 'Collines', code: 'CO', created_at: new Date(), updated_at: new Date() },
      { nom: 'Couffo', code: 'CF', created_at: new Date(), updated_at: new Date() },
      { nom: 'Donga', code: 'DO', created_at: new Date(), updated_at: new Date() },
      { nom: 'Littoral', code: 'LI', created_at: new Date(), updated_at: new Date() },
      { nom: 'Mono', code: 'MO', created_at: new Date(), updated_at: new Date() },
      { nom: 'Ouémé', code: 'OU', created_at: new Date(), updated_at: new Date() },
      { nom: 'Plateau', code: 'PL', created_at: new Date(), updated_at: new Date() },
      { nom: 'Zou', code: 'ZO', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departements', null, {});
  }
};