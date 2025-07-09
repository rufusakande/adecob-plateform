// Infrastructure.jsx
import { useState, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import { Link } from 'react-router-dom';
import '../styles/importData.css';
import Layout from "../Layouts/Layout";

function ImportData() {
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
        <div className="import-data">
          <h1>Importation de données</h1>
          <Link to="/add-infrastructure" className="add-manual-button">Saisir manuellement une infrastructure</Link>
          <UploadForm />
        </div>
      </main>
    </Layout>
  );
}

export default ImportData;