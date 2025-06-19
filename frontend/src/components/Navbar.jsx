import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    
  return (
    <nav>
      <h2>ADECOB</h2>
      <Link to="/">Accueil</Link>
      {user ? (
        <>
          <Link to="/dashboard">Tableau de bord</Link>
          <button onClick={logout}>Déconnexion</button>
        </>
      ) : (
        <Link to="/login">Connexion</Link>
      )}
    </nav>
  );
}

export default Navbar;
