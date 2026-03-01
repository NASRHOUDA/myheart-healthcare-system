import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .plr-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  .plr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .plr-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0;
  }
  .plr-subtitle {
    color: #64748b;
    margin-top: 4px;
  }

  .plr-back-btn {
    padding: 10px 20px;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: all 0.2s;
  }
  .plr-back-btn:hover {
    background: #e2e8f0;
  }

  .plr-search {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    position: relative;
  }
  .plr-search-input {
    flex: 1;
    padding: 12px 12px 12px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
  }
  .plr-search-input:focus {
    border-color: #9333ea;
  }
  .plr-search-icon {
    position: absolute;
    left: 28px;
    top: 28px;
    color: #94a3b8;
  }

  .plr-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .plr-stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
  }
  .plr-stat-number {
    font-size: 28px;
    font-weight: 500;
    color: #9333ea;
    margin-bottom: 4px;
  }
  .plr-stat-label {
    font-size: 14px;
    color: #64748b;
  }

  .plr-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: white;
    padding: 4px;
    border-radius: 8px;
    width: fit-content;
  }
  .plr-filter-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: transparent;
    color: #64748b;
    transition: all 0.2s;
  }
  .plr-filter-btn.active {
    background: #faf5ff;
    color: #9333ea;
    font-weight: 500;
  }

  .plr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .plr-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .plr-card:hover {
    box-shadow: 0 10px 25px -5px rgba(147,51,234,0.1);
    border-color: #9333ea;
  }

  .plr-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .plr-card-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
  .plr-card-date {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .plr-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  .plr-badge.normal { background: #dcfce7; color: #166534; }
  .plr-badge.abnormal { background: #fee2e2; color: #991b1b; }

  .plr-result {
    font-size: 1.3rem;
    font-weight: 500;
    color: #0f172a;
    margin: 12px 0;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    text-align: center;
    word-break: break-word;
  }
  .plr-result.normal { color: #16a34a; }
  .plr-result.abnormal { color: #dc2626; }

  .plr-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 16px 0;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
  }
  .plr-info-item {
    font-size: 0.85rem;
  }
  .plr-info-label {
    color: #64748b;
    margin-bottom: 2px;
  }
  .plr-info-value {
    font-weight: 500;
    color: #0f172a;
  }

  .plr-notes {
    background: #fff7ed;
    border-radius: 8px;
    padding: 12px;
    font-size: 0.9rem;
    color: #9a3412;
    margin-top: 12px;
  }

  .plr-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    color: #94a3b8;
  }
  .plr-empty-icon { font-size: 48px; margin-bottom: 16px; }

  .plr-technician {
    margin-top: 12px;
    font-size: 0.8rem;
    color: #94a3b8;
    text-align: right;
  }

  @media (max-width: 640px) {
    .plr-root { padding: 24px 16px; }
    .plr-grid { grid-template-columns: 1fr; }
    .plr-stats { grid-template-columns: 1fr; }
  }
`;

function PatientLabResults() {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, normal, abnormal

  useEffect(() => {
    fetchLabResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, filter, labResults]);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const patientId = user?.patientId || user?.id;
      
      const response = await axios.get(`http://localhost:8085/api/lab/patient/${patientId}`);
      
      // Filtrer pour n'avoir que les analyses terminées
      const completedResults = response.data.filter(r => r.status === 'COMPLETED');
      
      setLabResults(completedResults);
      setFilteredResults(completedResults);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement résultats:', err);
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...labResults];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.testName?.toLowerCase().includes(term) ||
        r.result?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut (normal/anormal)
    if (filter !== 'all') {
      filtered = filtered.filter(r => {
        const resultLower = r.result?.toLowerCase() || '';
        if (filter === 'normal') {
          return resultLower.includes('normal') || resultLower.includes('négatif') || resultLower.includes('negatif');
        } else if (filter === 'abnormal') {
          return resultLower.includes('anormal') || resultLower.includes('positif');
        }
        return true;
      });
    }

    // Trier par date (plus récent d'abord)
    filtered.sort((a, b) => new Date(b.date || b.completedDate) - new Date(a.date || a.completedDate));

    setFilteredResults(filtered);
  };

  const getResultClass = (result) => {
    if (!result) return '';
    const lower = result.toLowerCase();
    if (lower.includes('normal') || lower.includes('négatif') || lower.includes('negatif')) return 'normal';
    if (lower.includes('anormal') || lower.includes('positif')) return 'abnormal';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = {
    total: labResults.length,
    normal: labResults.filter(r => {
      const lower = r.result?.toLowerCase() || '';
      return lower.includes('normal') || lower.includes('négatif') || lower.includes('negatif');
    }).length,
    abnormal: labResults.filter(r => {
      const lower = r.result?.toLowerCase() || '';
      return lower.includes('anormal') || lower.includes('positif');
    }).length
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="plr-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="plr-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#9333ea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px auto'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b' }}>Chargement de vos résultats...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="plr-root">
        {/* Header */}
        <div className="plr-header">
          <div>
            <h1 className="plr-title">Mes résultats d'analyses</h1>
            <p className="plr-subtitle">
              Consultez tous vos résultats de laboratoire
            </p>
          </div>
          <Link to="/patient/dashboard" className="plr-back-btn">
            <i className="bi bi-arrow-left" /> Retour au tableau de bord
          </Link>
        </div>

        {/* Statistiques */}
        <div className="plr-stats">
          <div className="plr-stat-card">
            <div className="plr-stat-number">{stats.total}</div>
            <div className="plr-stat-label">Analyses totales</div>
          </div>
          <div className="plr-stat-card">
            <div className="plr-stat-number" style={{ color: '#16a34a' }}>{stats.normal}</div>
            <div className="plr-stat-label">Résultats normaux</div>
          </div>
          <div className="plr-stat-card">
            <div className="plr-stat-number" style={{ color: '#dc2626' }}>{stats.abnormal}</div>
            <div className="plr-stat-label">Résultats anormaux</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="plr-filters">
          <button
            className={`plr-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`plr-filter-btn ${filter === 'normal' ? 'active' : ''}`}
            onClick={() => setFilter('normal')}
          >
            Normaux
          </button>
          <button
            className={`plr-filter-btn ${filter === 'abnormal' ? 'active' : ''}`}
            onClick={() => setFilter('abnormal')}
          >
            Anormaux
          </button>
        </div>

        {/* Recherche */}
        <div className="plr-search">
          <i className="bi bi-search plr-search-icon" />
          <input
            type="text"
            className="plr-search-input"
            placeholder="Rechercher par analyse ou résultat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Liste des résultats */}
        <div className="plr-grid">
          {filteredResults.length === 0 ? (
            <div className="plr-empty">
              <div className="plr-empty-icon">🔬</div>
              <h3>Aucun résultat trouvé</h3>
              <p>Vous n'avez pas encore de résultats d'analyses disponibles.</p>
            </div>
          ) : (
            filteredResults.map(result => {
              const resultClass = getResultClass(result.result);
              return (
                <div key={result._id} className="plr-card">
                  <div className="plr-card-header">
                    <h3 className="plr-card-title">{result.testName}</h3>
                    <span className="plr-card-date">{formatDate(result.completedDate || result.date)}</span>
                  </div>

                  <div className={`plr-result ${resultClass}`}>
                    {result.result}
                  </div>

                  <div className="plr-info">
                    <div className="plr-info-item">
                      <div className="plr-info-label">Laboratoire</div>
                      <div className="plr-info-value">Labo Central</div>
                    </div>
                    {result.referenceRange && (
                      <div className="plr-info-item">
                        <div className="plr-info-label">Valeurs de référence</div>
                        <div className="plr-info-value">{result.referenceRange}</div>
                      </div>
                    )}
                  </div>

                  {result.notes && (
                    <div className="plr-notes">
                      <i className="bi bi-info-circle" /> {result.notes}
                    </div>
                  )}

                  <span className={`plr-badge ${resultClass}`}>
                    {resultClass === 'normal' ? 'Normal' : resultClass === 'abnormal' ? 'Anormal' : 'À vérifier'}
                  </span>

                  {result.technician && (
                    <div className="plr-technician">
                      Analysé par: {result.technician}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default PatientLabResults;