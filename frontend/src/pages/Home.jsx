// Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layouts/Layout";
import '../styles/home.css';

function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animation after page load
    setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
  }, []);

  return (
    <Layout>
      <main className={`main-content ${animationComplete ? 'animate' : ''}`}>
        <div className="hero-section">
          <div className="hero-text">
            <h1 className="title">Bienvenue sur la plateforme ADECOB</h1>
            <p className="subtitle">Gestion et visualisation de données simplifiées</p>
            <div className="action-buttons">
              <Link to="/login" className="btn btn-primary">Connexion</Link>
              <Link to="/register" className="btn btn-secondary">Inscription</Link>
            </div>
          </div>
          <div className="hero-graphic">
            <div className="graphic-element circle-1"></div>
            <div className="graphic-element circle-2"></div>
            <div className="graphic-element square"></div>
          </div>
        </div>

        <div className="features-section">
          <h2>Nos fonctionnalités</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon import"></div>
              <h3>Importation</h3>
              <p>Importez facilement vos données depuis diverses sources</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon visual"></div>
              <h3>Visualisation</h3>
              <p>Créez des visualisations interactives de vos données</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon process"></div>
              <h3>Traitement</h3>
              <p>Analysez et transformez vos données avec nos outils avancés</p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Home;