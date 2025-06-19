'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('communes', [
      // Borgou (département_id: 4)
      { nom: 'Parakou', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Tchaourou', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'N\'Dali', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Nikki', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Bembèrèké', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Kalalé', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Sinendé', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      { nom: 'Pèrèrè', departement_id: 4, created_at: new Date(), updated_at: new Date() },
      
      // Littoral (département_id: 8)
      { nom: 'Cotonou', departement_id: 8, created_at: new Date(), updated_at: new Date() },
      
      // Atlantique (département_id: 3)
      { nom: 'Abomey-Calavi', departement_id: 3, created_at: new Date(), updated_at: new Date() },
      { nom: 'Allada', departement_id: 3, created_at: new Date(), updated_at: new Date() },
      { nom: 'Ouidah', departement_id: 3, created_at: new Date(), updated_at: new Date() },
      { nom: 'Sô-Ava', departement_id: 3, created_at: new Date(), updated_at: new Date() },
      
      // Ouémé (département_id: 10)
      { nom: 'Porto-Novo', departement_id: 10, created_at: new Date(), updated_at: new Date() },
      { nom: 'Sèmè-Kpodji', departement_id: 10, created_at: new Date(), updated_at: new Date() },
      { nom: 'Adjarra', departement_id: 10, created_at: new Date(), updated_at: new Date() },
      
      // Zou (département_id: 12)
      { nom: 'Abomey', departement_id: 12, created_at: new Date(), updated_at: new Date() },
      { nom: 'Bohicon', departement_id: 12, created_at: new Date(), updated_at: new Date() },
      { nom: 'Covè', departement_id: 12, created_at: new Date(), updated_at: new Date() },
      
      // Mono (département_id: 9)
      { nom: 'Lokossa', departement_id: 9, created_at: new Date(), updated_at: new Date() },
      { nom: 'Comè', departement_id: 9, created_at: new Date(), updated_at: new Date() },
      
      // Atacora (département_id: 2)
      { nom: 'Natitingou', departement_id: 2, created_at: new Date(), updated_at: new Date() },
      { nom: 'Tanguiéta', departement_id: 2, created_at: new Date(), updated_at: new Date() },
      
      // Alibori (département_id: 1)
      { nom: 'Kandi', departement_id: 1, created_at: new Date(), updated_at: new Date() },
      { nom: 'Malanville', departement_id: 1, created_at: new Date(), updated_at: new Date() },
      
      // Donga (département_id: 7)
      { nom: 'Djougou', departement_id: 7, created_at: new Date(), updated_at: new Date() },
      { nom: 'Bassila', departement_id: 7, created_at: new Date(), updated_at: new Date() },
      
      // Couffo (département_id: 6)
      { nom: 'Aplahoué', departement_id: 6, created_at: new Date(), updated_at: new Date() },
      { nom: 'Dogbo', departement_id: 6, created_at: new Date(), updated_at: new Date() },
      
      // Collines (département_id: 5)
      { nom: 'Savalou', departement_id: 5, created_at: new Date(), updated_at: new Date() },
      { nom: 'Bantè', departement_id: 5, created_at: new Date(), updated_at: new Date() },
      
      // Plateau (département_id: 11)
      { nom: 'Pobè', departement_id: 11, created_at: new Date(), updated_at: new Date() },
      { nom: 'Kétou', departement_id: 11, created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('communes', null, {});
  }
};