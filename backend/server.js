const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes"); // Routes pour gérer les données
const { authMiddleware } = require("./middleware/authMiddleware");
const db = require("./config/db");
const path = require('path');

const { testConnection } = require('./models');
const { initializeDatabase } = require('./utils/initDatabase');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// En production, servir les fichiers statiques du build React
/* app.use(express.static(path.join(__dirname, '../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }); */

// Routes publiques (authentification)
app.use("/api/auth", authRoutes);

// Routes protégées (nécessitent un token JWT)
app.use("/api/data", authMiddleware, dataRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API ADECOB - Plateforme de gestion des infrastructures',
    status: 'active',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
// Démarrage du serveur avec initialisation automatique
async function startServer() {
  try {
    // Initialiser la base de données
    await initializeDatabase();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer();