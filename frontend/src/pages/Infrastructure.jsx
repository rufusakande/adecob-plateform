// Infrastructure.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layouts/Layout";
import '../styles/home.css';
import InfrastructureDetails from "../components/InfrastructureDetails";

function Infrastructure() {
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
        <InfrastructureDetails/>
      </main>
    </Layout>
  );
}

export default Infrastructure;