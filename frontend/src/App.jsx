import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ImportData from "./pages/ImportData";
//import AdminPanel from "./pages/AdminPanel"; // Exemple de page admin
//import Profile from "./pages/Profile"; // Exemple de page profil
import { ProtectedRoute, AdminRoute, PublicRoute } from "./context/ProtectedRoute";
import Infrastructure from "./pages/Infrastructure";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Home />} />
      
      {/* Routes publiques restreintes (utilisateur non connecté seulement) */}
      <Route 
        path="/login" 
        element={
          <PublicRoute restricted={true}>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute restricted={true}>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Routes protégées (utilisateur connecté requis) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/infrastructure/:id" 
        element={
          <ProtectedRoute>
            <Infrastructure />
          </ProtectedRoute>
        } 
      />
      {/* <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      /> */}
      <Route 
        path="/import" 
        element={
          <ProtectedRoute>
            <ImportData />
          </ProtectedRoute>
        } 
      />
      
      {/* Routes administrateur */}
      {/* <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      /> */}
      
      {/* Route par défaut - 404 */}
      <Route path="*" element={<div>Page non trouvée</div>} />
    </Routes>
  );
}

export default App;