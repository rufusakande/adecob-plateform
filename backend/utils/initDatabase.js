const { execSync } = require('child_process');
const { sequelize } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL établie');

    // Exécuter les migrations
    try {
      execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
      console.log('✅ Migrations exécutées avec succès');
    } catch (error) {
      console.log('ℹ️  Les migrations ont peut-être déjà été exécutées');
    }

    // Exécuter les seeders
    try {
      execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
      console.log('✅ Données initiales insérées avec succès');
    } catch (error) {
      console.log('ℹ️  Les données initiales ont peut-être déjà été insérées');
    }

    console.log('🎉 Base de données initialisée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };