const { Sequelize } = require('sequelize');
const config = require('../config/database.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config);

// Test de connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
  }
}

// Synchronisation automatique (optionnel - utilise les migrations à la place)
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: false }); // Ne pas utiliser en production
    console.log('✅ Base de données synchronisée.');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};