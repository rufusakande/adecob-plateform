const { execSync } = require('child_process');

const commands = {
  // Créer une nouvelle migration
  createMigration: (name) => {
    execSync(`npx sequelize-cli migration:generate --name ${name}`, { stdio: 'inherit' });
  },
  
  // Créer un nouveau seeder
  createSeeder: (name) => {
    execSync(`npx sequelize-cli seed:generate --name ${name}`, { stdio: 'inherit' });
  },
  
  // Exécuter les migrations
  migrate: () => {
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  },
  
  // Annuler la dernière migration
  undoMigration: () => {
    execSync('npx sequelize-cli db:migrate:undo', { stdio: 'inherit' });
  },
  
  // Annuler toutes les migrations
  undoAllMigrations: () => {
    execSync('npx sequelize-cli db:migrate:undo:all', { stdio: 'inherit' });
  },
  
  // Exécuter les seeders
  seed: () => {
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  },
  
  // Annuler tous les seeders
  undoAllSeeders: () => {
    execSync('npx sequelize-cli db:seed:undo:all', { stdio: 'inherit' });
  },
  
  // Reset complet de la base
  reset: () => {
    execSync('npx sequelize-cli db:migrate:undo:all', { stdio: 'inherit' });
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  }
};

// Usage: node scripts/db-commands.js [command] [args]
const command = process.argv[2];
const args = process.argv.slice(3);

if (commands[command]) {
  commands[command](...args);
} else {
  console.log('Commandes disponibles:');
  console.log('- createMigration <name>');
  console.log('- createSeeder <name>');
  console.log('- migrate');
  console.log('- undoMigration');
  console.log('- undoAllMigrations');
  console.log('- seed');
  console.log('- undoAllSeeders');
  console.log('- reset');
}

module.exports = commands;