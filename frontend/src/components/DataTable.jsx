import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function DataTable() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  
  // Utilisation du contexte d'authentification
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la sélection et l'export
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filtres spécifiques au backend
  const [filters, setFilters] = useState({
    commune: '',
    statut_traitement: '',
    etat_fonctionnement: '',
    type_infrastructure: ''
  });

  // Options pour les filtres
  const [filterOptions, setFilterOptions] = useState({
    communes: [],
    statuts: ['nouveau', 'en_cours', 'traite', 'valide'],
    etats: ['Bon', 'Moyen', 'Mauvais', 'Hors service', 'Non fonctionnel'],
    types: []
  });

  // Fonction pour récupérer le token depuis localStorage
  const getAccessToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("accessToken");
  };

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        fetchData();
        fetchFilterOptions();
      }
    }
  }, [currentPage, itemsPerPage, sortConfig, searchTerm, filters, isAuthenticated, loading]);

  // Réinitialiser la sélection quand les données changent
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [data]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      
      if (!isAuthenticated || !user) {
        setError("Vous devez être connecté pour consulter les données. Veuillez vous reconnecter.");
        setDataLoading(false);
        return;
      }

      const token = getAccessToken();
      
      if (!token) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.");
        setDataLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/data`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            sortBy: sortConfig.key,
            sortDirection: sortConfig.direction,
            ...filters
          }
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setData([]);
        setTotalItems(0);
        setTotalPages(0);
      }
      setError(null);
      setDataLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        setError("Session expirée. Veuillez vous reconnecter.");
        setDataLoading(false);
        return;
      }
      setError("Erreur lors du chargement des données");
      setDataLoading(false);
      console.error(err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const token = getAccessToken();
      if (!token || !isAuthenticated) return;

      const communesResponse = await axios.get(
        `${API_URL}/data/communes/allowed`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setFilterOptions(prev => ({
        ...prev,
        communes: communesResponse.data || []
      }));
    } catch (err) {
      console.error("Erreur lors du chargement des options de filtres:", err);
    }
  };

  // Gestion de la sélection
  const handleSelectItem = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.size === data.length && data.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(data.map(item => item.id));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  // Fonction d'export PDF
  const handleExportPDF = async (exportAll = false) => {
    try {
      setIsExporting(true);
      const token = getAccessToken();
      
      if (!token) {
        setError("Token d'authentification manquant.");
        return;
      }

      let idsToExport = [];
      
      if (exportAll) {
        // Exporter toutes les données selon les filtres actuels
        idsToExport = 'all';
      } else {
        // Exporter seulement les éléments sélectionnés
        idsToExport = Array.from(selectedItems);
        if (idsToExport.length === 0) {
          alert("Veuillez sélectionner au moins une infrastructure à exporter.");
          return;
        }
      }

      const response = await axios.post(
        `${API_URL}/data/export/pdf`,
        {
          ids: idsToExport,
          filters: exportAll ? filters : {},
          search: exportAll ? searchTerm : ''
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      // Créer et télécharger le fichier PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = exportAll ? 
        `infrastructures_export_${new Date().toISOString().split('T')[0]}.pdf` :
        `infrastructures_selection_${new Date().toISOString().split('T')[0]}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Réinitialiser la sélection après export
      if (!exportAll) {
        setSelectedItems(new Set());
        setSelectAll(false);
      }

    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
      setError("Erreur lors de l'export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <span className="sort-icon default">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="sort-icon ascending">↑</span>
      : <span className="sort-icon descending">↓</span>;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      commune: '',
      statut_traitement: '',
      etat_fonctionnement: '',
      type_infrastructure: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewDetails = (infrastructureId) => {
    navigate(`/infrastructure/${infrastructureId}`);
  };

  const debouncedSearch = (e) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(e);
    }, 400);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'nouveau': 'status-nouveau',
      'en_cours': 'status-en-cours',
      'traite': 'status-traite',
      'valide': 'status-valide'
    };
    
    const statusLabels = {
      'nouveau': 'Nouveau',
      'en_cours': 'En cours',
      'traite': 'Traité',
      'valide': 'Validé'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getEtatBadge = (etat) => {
    const etatClasses = {
      'Bon': 'etat-bon',
      'Moyen': 'etat-moyen',
      'Mauvais': 'etat-mauvais',
      'Hors service': 'etat-hors-service',
      'Non fonctionnel': 'etat-non-fonctionnel'
    };

    return (
      <span className={`etat-badge ${etatClasses[etat] || ''}`}>
        {etat || '-'}
      </span>
    );
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="pagination-arrow"
          onClick={() => handlePageChange(1)} 
          disabled={currentPage === 1}
          aria-label="Première page"
        >
          «
        </button>
        <button 
          className="pagination-arrow"
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          ‹
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={currentPage === number ? 'active' : ''}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        
        <button 
          className="pagination-arrow"
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          ›
        </button>
        <button 
          className="pagination-arrow"
          onClick={() => handlePageChange(totalPages)} 
          disabled={currentPage === totalPages}
          aria-label="Dernière page"
        >
          »
        </button>
      </div>
    );
  };

  // Afficher un message de chargement si l'authentification est en cours
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-auth">
          <div className="spinner"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Afficher un message si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="table-container">
        <div className="auth-required">
          <h3>🔒 Authentification requise</h3>
          <p>Vous devez être connecté pour consulter les données d'infrastructure.</p>
          <p>Veuillez vous connecter pour continuer.</p>
        </div>
      </div>
    );
  }

  if (dataLoading && !data.length) {
    return (
      <div className="table-container loading">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">Réessayer</button>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="table-container empty">
        <div className="empty-icon">📋</div>
        <p>Aucune infrastructure trouvée</p>
        <p className="empty-subtitle">
          {searchTerm || Object.values(filters).some(f => f) 
            ? "Essayez de modifier vos critères de recherche" 
            : "Importez des données pour commencer"
          }
        </p>
        {(searchTerm || Object.values(filters).some(f => f)) && (
          <button onClick={clearFilters} className="btn btn-secondary">
            Effacer les filtres
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table-container">

      {/* Barre d'outils avec recherche et filtres */}
      <div className="table-toolbar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher une infrastructure..."
            defaultValue={searchTerm}
            onChange={debouncedSearch}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <select 
            value={filters.commune} 
            onChange={(e) => handleFilterChange('commune', e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les communes</option>
            {filterOptions.communes.map(commune => (
              <option key={commune} value={commune}>{commune}</option>
            ))}
          </select>

          <select 
            value={filters.statut_traitement} 
            onChange={(e) => handleFilterChange('statut_traitement', e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les statuts</option>
            {filterOptions.statuts.map(statut => (
              <option key={statut} value={statut}>
                {statut === 'nouveau' ? 'Nouveau' : 
                 statut === 'en_cours' ? 'En cours' : 
                 statut === 'traite' ? 'Traité' : 'Validé'}
              </option>
            ))}
          </select>

          <select 
            value={filters.etat_fonctionnement} 
            onChange={(e) => handleFilterChange('etat_fonctionnement', e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les états</option>
            {filterOptions.etats.map(etat => (
              <option key={etat} value={etat}>{etat}</option>
            ))}
          </select>

          {(searchTerm || Object.values(filters).some(f => f)) && (
            <button onClick={clearFilters} className="btn btn-outline">
              Effacer
            </button>
          )}
        </div>

        <div className="items-per-page">
          <label htmlFor="items-per-page">Afficher</label>
          <select 
            id="items-per-page"
            value={itemsPerPage} 
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>lignes</span>
        </div>
      </div>

      {/* Barre d'actions pour l'export */}
      <div className="export-toolbar">
        <div className="selection-info">
          {selectedItems.size > 0 && (
            <span className="selected-count">
              {selectedItems.size} élément{selectedItems.size > 1 ? 's' : ''} sélectionné{selectedItems.size > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="export-actions">
          <button 
            onClick={() => handleExportPDF(false)}
            disabled={selectedItems.size === 0 || isExporting}
            className="btn btn-export"
            title="Exporter la sélection en PDF"
          >
            {isExporting ? 'Export en cours...' : '📄 Exporter sélection'}
          </button>
          
          <button 
            onClick={() => handleExportPDF(true)}
            disabled={isExporting}
            className="btn btn-export-all"
            title="Exporter toutes les données en PDF"
          >
            {isExporting ? 'Export en cours...' : '📄 Exporter tout'}
          </button>
        </div>
      </div>

      {/* Tableau responsive */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={data.length === 0}
                />
              </th>
              <th onClick={() => handleSort('id')} className={sortConfig.key === 'id' ? 'sorted' : ''}>
                ID {getSortIcon('id')}
              </th>
              <th onClick={() => handleSort('commune')} className={sortConfig.key === 'commune' ? 'sorted' : ''}>
                Commune {getSortIcon('commune')}
              </th>
              <th onClick={() => handleSort('village_quartier')} className={sortConfig.key === 'village_quartier' ? 'sorted' : ''}>
                Village/Quartier {getSortIcon('village_quartier')}
              </th>
              <th onClick={() => handleSort('type_infrastructure')} className={sortConfig.key === 'type_infrastructure' ? 'sorted' : ''}>
                Type d'infrastructure {getSortIcon('type_infrastructure')}
              </th>
              <th onClick={() => handleSort('nom_infrastructure')} className={sortConfig.key === 'nom_infrastructure' ? 'sorted' : ''}>
                Nom {getSortIcon('nom_infrastructure')}
              </th>
              <th onClick={() => handleSort('etat_fonctionnement')} className={sortConfig.key === 'etat_fonctionnement' ? 'sorted' : ''}>
                État {getSortIcon('etat_fonctionnement')}
              </th>
              <th onClick={() => handleSort('statut_traitement')} className={sortConfig.key === 'statut_traitement' ? 'sorted' : ''}>
                Statut {getSortIcon('statut_traitement')}
              </th>
              <th onClick={() => handleSort('date_creation')} className={sortConfig.key === 'date_creation' ? 'sorted' : ''}>
                Date création {getSortIcon('date_creation')}
              </th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id} 
                className={`
                  ${rowIndex % 2 === 0 ? 'even' : 'odd'}
                  ${row.statut_traitement === 'traite' ? 'row-treated' : ''}
                  ${row.statut_traitement === 'nouveau' ? 'row-new' : ''}
                  ${selectedItems.has(row.id) ? 'row-selected' : ''}
                `}
              >
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(row.id)}
                    onChange={() => handleSelectItem(row.id)}
                  />
                </td>
                <td>{row.id}</td>
                <td>{row.commune || '-'}</td>
                <td>{row.village_quartier || '-'}</td>
                <td>{row.type_infrastructure || '-'}</td>
                <td className="infrastructure-name">
                  {row.nom_infrastructure || '-'}
                </td>
                <td>{getEtatBadge(row.etat_fonctionnement)}</td>
                <td>{getStatusBadge(row.statut_traitement)}</td>
                <td>{formatDate(row.date_creation)}</td>
                <td className="actions-cell">
                  <button 
                    onClick={() => handleViewDetails(row.id)}
                    className="btn btn-details"
                    title="Voir les détails"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied de page avec pagination */}
      <div className="table-footer">
        <div className="showing-info">
          Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} infrastructure{totalItems > 1 ? 's' : ''}
        </div>
        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  );
}

export default DataTable;