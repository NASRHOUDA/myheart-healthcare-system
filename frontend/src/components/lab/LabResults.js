import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .lr-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
  }

  .lr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .lr-title {
    font-size: 2rem;
    font-weight: 300;
    color: #0f172a;
    margin: 0;
  }
  .lr-subtitle {
    color: #64748b;
    margin-top: 4px;
  }

  .lr-search {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    position: relative;
  }
  .lr-search-input {
    flex: 1;
    padding: 12px 12px 12px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
  }
  .lr-search-icon {
    position: absolute;
    left: 28px;
    top: 28px;
    color: #94a3b8;
  }

  .lr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .lr-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .lr-card:hover {
    box-shadow: 0 10px 25px -5px rgba(147,51,234,0.1);
    border-color: #9333ea;
  }

  .lr-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .lr-card-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px;
  }
  .lr-card-patient {
    font-size: 0.9rem;
    color: #9333ea;
    font-weight: 500;
  }

  .lr-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  .lr-badge.normal { background: #dcfce7; color: #166534; }
  .lr-badge.abnormal { background: #fee2e2; color: #991b1b; }
  .lr-badge.pending { background: #fef9c3; color: #854d0e; }

  .lr-result {
    font-size: 1.5rem;
    font-weight: 500;
    color: #0f172a;
    margin: 12px 0;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    text-align: center;
    word-break: break-word;
  }
  .lr-result.normal { color: #16a34a; }
  .lr-result.abnormal { color: #dc2626; }

  .lr-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 16px 0;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
  }
  .lr-info-item {
    font-size: 0.85rem;
  }
  .lr-info-label {
    color: #64748b;
    margin-bottom: 2px;
  }
  .lr-info-value {
    font-weight: 500;
    color: #0f172a;
  }

  .lr-notes {
    background: #fff7ed;
    border-radius: 8px;
    padding: 12px;
    font-size: 0.9rem;
    color: #9a3412;
    margin-top: 12px;
  }

  .lr-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    color: #94a3b8;
  }
  .lr-empty-icon { font-size: 48px; margin-bottom: 16px; }
`;

function LabResults() {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const testId = queryParams.get('test');
  
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allResults.length > 0 && testId) {
      const found = allResults.find(r => r._id === testId);
      setSelectedTest(found || null);
    } else {
      setSelectedTest(null);
    }
  }, [testId, allResults]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, allResults, selectedTest]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les résultats
      let labData = [];
      try {
        const labRes = await axios.get('http://localhost:8085/api/lab');
        labData = labRes.data;
        console.log('Données laboratoire chargées:', labData);
      } catch (err) {
        console.log('Service laboratoire non disponible');
      }
      
      // Récupérer tous les patients
      let patientsData = [];
      try {
        const patientsRes = await axios.get('http://localhost:8081/api/patients');
        patientsData = patientsRes.data;
      } catch (err) {
        console.log('Service patients non disponible');
      }
      
      const patientsMap = {};
      patientsData.forEach(p => patientsMap[p.id] = p);
      setPatients(patientsMap);

      // Filtrer pour n'avoir que les analyses terminées
      const completedResults = labData.filter(t => t.status === 'COMPLETED');

      setAllResults(completedResults);
      setFilteredResults(completedResults);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const filterResults = () => {
    if (selectedTest) {
      setFilteredResults([selectedTest]);
      return;
    }

    let filtered = [...allResults];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const patient = patients[r.patientId];
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        return patientName.includes(term) ||
               r.testName?.toLowerCase().includes(term) ||
               r.result?.toLowerCase().includes(term);
      });
    }

    setFilteredResults(filtered);
  };

  const getPatientDisplay = (patientId) => {
    const patient = patients[patientId];
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
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
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Chargement...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="lr-root">
        <div className="lr-header">
          <div>
            <h1 className="lr-title">
              {selectedTest ? 'Détail du résultat' : 'Résultats d\'analyses'}
            </h1>
            <p className="lr-subtitle">
              {selectedTest 
                ? `Analyse pour ${getPatientDisplay(selectedTest.patientId)}`
                : `${filteredResults.length} résultat${filteredResults.length > 1 ? 's' : ''} disponible${filteredResults.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link to="/lab/tests" style={{ 
            padding: '12px 24px',
            background: '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}>
            <i className="bi bi-arrow-left" /> Retour aux analyses
          </Link>
        </div>

        {!selectedTest && (
          <div className="lr-search">
            <i className="bi bi-search lr-search-icon" />
            <input
              type="text"
              className="lr-search-input"
              placeholder="Rechercher par patient, analyse ou résultat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="lr-grid">
          {filteredResults.length === 0 ? (
            <div className="lr-empty">
              <div className="lr-empty-icon">🔬</div>
              <h3>Aucun résultat trouvé</h3>
              <p>Les résultats d'analyses apparaîtront ici une fois les tests terminés.</p>
            </div>
          ) : (
            filteredResults.map(result => {
              const resultClass = getResultClass(result.result);
              
              return (
                <div key={result._id} className="lr-card">
                  <div className="lr-card-header">
                    <div>
                      <h3 className="lr-card-title">{result.testName}</h3>
                      <div className="lr-card-patient">
                        <i className="bi bi-person" /> {getPatientDisplay(result.patientId)}
                      </div>
                    </div>
                    <span className={`lr-badge ${resultClass || 'pending'}`}>
                      {resultClass === 'normal' ? 'Normal' : resultClass === 'abnormal' ? 'Anormal' : 'À vérifier'}
                    </span>
                  </div>

                  <div className={`lr-result ${resultClass}`}>
                    {result.result}
                  </div>

                  <div className="lr-info">
                    <div className="lr-info-item">
                      <div className="lr-info-label">Date d'analyse</div>
                      <div className="lr-info-value">
                        {formatDate(result.completedDate || result.date)}
                      </div>
                    </div>
                    {result.referenceRange && (
                      <div className="lr-info-item">
                        <div className="lr-info-label">Valeurs de référence</div>
                        <div className="lr-info-value">{result.referenceRange}</div>
                      </div>
                    )}
                  </div>

                  {result.notes && (
                    <div className="lr-notes">
                      <i className="bi bi-info-circle" /> {result.notes}
                    </div>
                  )}

                  {result.technician && (
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                      Analysé par: {result.technician}
                    </div>
                  )}

                  {!selectedTest && (
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                      <Link 
                        to={`/lab/results?test=${result._id}`}
                        style={{ fontSize: '0.85rem', color: '#9333ea', textDecoration: 'none' }}
                      >
                        Voir détails →
                      </Link>
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

export default LabResults;