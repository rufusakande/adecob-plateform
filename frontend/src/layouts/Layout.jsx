// Layout.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";
import './Layout.css';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth <= 991);

  useEffect(() => {
    // Handle screen size changes
    const handleResize = () => {
      const isMobile = window.innerWidth <= 991;
      setMobileView(isMobile);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (!isMobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-container">
      <Header 
        toggleSidebar={toggleSidebar} 
        isSidebarCollapsed={sidebarCollapsed} 
      />

      <div className="content-container">
        <Sidebar 
          isOpen={sidebarOpen} 
          isCollapsed={sidebarCollapsed} 
          toggleCollapse={toggleSidebarCollapse} 
        />

        <div className={`content-wrapper ${sidebarOpen ? 'sidebar-open' : ''} ${!mobileView && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
          
          <Footer />
          
          {/* Overlay pour fermer le sidebar sur mobile */}
          {sidebarOpen && mobileView && (
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Layout;