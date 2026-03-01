import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .dlr-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  .dlr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .dlr-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0;
  }
  .dlr-subtitle {
    color: #64748b;
    margin-top: 4px;
  }

  .dlr-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .dlr-stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .dlr-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(37,99,235,0.1);
  }
  .dlr-stat-number {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #2563eb;
    line-height: 1;
    margin-bottom: 4px;
  }
  .dlr-stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .dlr-filters {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .dlr-search {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  .dlr-search-input {
    flex: 1;
    padding: 12px 12px 12px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 12px center;
  }
  .dlr-filter-select {
    width: 200px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    outline: none;
  }

  .dlr-table {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
  }
  .dlr-table table {
    width: 100%;
    border-collapse: collapse;
  }
  .dlr-table th {
    background: #f8fafc;
    padding: 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }
  .dlr-table td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .dlr-table tr:last-child td { border-bottom: none; }
  .dlr-table tr:hover td { background: #f8fafc; }

  .dlr-patient-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .dlr-patient-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .dlr-patient-name {
    font-weight: 500;
    color: #0f172a;
  }
  .dlr-patient-email {
    font-size: 12px;
    color: #94a3b8;
  }

  .dlr-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }
  .dlr-badge.normal { background: #dcfce7; color: #166534; }
  .dlr-badge.abnormal { background: #fee2e2; color: #991b1b; }
  .dlr-badge.pending { background: #fef9c3; color: #854d0e; }

  .dlr-result-preview {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #475569;
  }

  .dlr-view-btn {
    padding: 6px 12px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }
  .dlr-view-btn:hover {
    background: #dbeafe;
  }

  .dlr-empty {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    color: #94a3b8;
  }
  .dlr-empty-icon { font-size: 48px; margin-bottom: 16px; }

  /* Modal styles */
  .dlr-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .dlr-modal {
    background: white;
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 32px;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
  .dlr-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  .dlr-modal-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0;
  }
  .dlr-modal-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px;
  }
  .dlr-modal-close:hover { color: #475569; }
  .dlr-modal-patient {
    font-size: 1rem;
    color: #2563eb;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  .dlr-modal-result {
    font-size: 1.2rem;
    font-weight: 500;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    margin: 20px 0;
    text-align: center;
  }
  .dlr-modal-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin: 20px 0;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
  }
  .dlr-modal-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 4px;
  }
  .dlr-modal-value {
    font-size: 0.95rem;
    font-weight: 500;
    color: #0f172a;
  }
  .dlr-modal-notes {
    background: #fff7ed;
    border-radius: 8px;
    padding: 16px;
    color: #9a3412;
  }
`;

function DoctorLabResults() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, filterPatient, filterStatus, labResults, patients]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Récupérer les rendez-vous du médecin pour connaître ses patients
      const appointmentsRes = await axios.get(`http://localhost:8082/api/appointments/doctor/${user.id}`);
      const doctorAppointments = appointmentsRes.data;

      // 2. Extraire les IDs patients uniques
      const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
      
      // 3. Récupérer les informations des patients
      const patientsData = [];
      const patientsMap = {};
      
      for (const patientId of patientIds) {
        try {
          const patientRes = await axios.get(`http://localhost:8081/api/patients/${patientId}`);
          const patient = patientRes.data;
          patientsData.push(patient);
          patientsMap[patientId] = patient;
        } catch (err) {
          console.log(`Patient ${patientId} non trouvé`);
        }
      }
      setPatients(patientsData);

      // 4. Récupérer tous les résultats de laboratoire
      let allLabResults = [];
      try {
        const labRes = await axios.get('http://localhost:8085/api/lab');
        allLabResults = labRes.data;
      } catch (err) {
        console.log('Service laboratoire non disponible');
      }

      // 5. Filtrer pour n'avoir que les résultats des patients du médecin
      const doctorLabResults = allLabResults
        .filter(r => patientIds.includes(r.patientId) && r.status === 'COMPLETED')
        .map(r => ({
          ...r,
          patient: patientsMap[r.patientId] || { firstName: 'Patient', lastName: `#${r.patientId}` }
        }))
        .sort((a, b) => new Date(b.completedDate || b.date) - new Date(a.completedDate || a.date));

      setLabResults(doctorLabResults);
      setFilteredResults(doctorLabResults);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement données:', err);
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
        `${r.patient?.firstName} ${r.patient?.lastName}`.toLowerCase().includes(term) ||
        r.result?.toLowerCase().includes(term)
      );
    }

    // Filtre par patient
    if (filterPatient !== 'all') {
      filtered = filtered.filter(r => r.patientId === parseInt(filterPatient));
    }

    // Filtre par statut (normal/anormal)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => {
        const resultLower = r.result?.toLowerCase() || '';
        if (filterStatus === 'normal') {
          return resultLower.includes('normal') || resultLower.includes('négatif') || resultLower.includes('negatif');
        } else if (filterStatus === 'abnormal') {
          return resultLower.includes('anormal') || resultLower.includes('positif');
        }
        return true;
      });
    }

    setFilteredResults(filtered);
  };

  const getResultClass = (result) => {
    if (!result) return '';
    const lower = result.toLowerCase();
    if (lower.includes('normal') || lower.includes('négatif') || lower.includes('negatif')) return 'normal';
    if (lower.includes('anormal') || lower.includes('positif')) return 'abnormal';
    return 'pending';
  };

  const getInitials = (patient) => {
    if (!patient) return '?';
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
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

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowModal(true);
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
    }).length,
    patients: patients.length
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="dlr-root">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b' }}>Chargement des résultats...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dlr-root">
        {/* Header */}
        <div className="dlr-header">
          <div>
            <h1 className="dlr-title">Résultats de laboratoire</h1>
            <p className="dlr-subtitle">
              Dr. {user?.firstName} {user?.lastName} · Résultats de vos patients
            </p>
          </div>
          <Link to="/doctor/dashboard" className="dlr-view-btn" style={{ padding: '10px 20px' }}>
            <i className="bi bi-arrow-left" /> Retour
          </Link>
        </div>

        {/* Statistiques */}
        <div className="dlr-stats">
          <div className="dlr-stat-card">
            <div className="dlr-stat-number">{stats.patients}</div>
            <div className="dlr-stat-label">Patients</div>
          </div>
          <div className="dlr-stat-card">
            <div className="dlr-stat-number">{stats.total}</div>
            <div className="dlr-stat-label">Analyses totales</div>
          </div>
          <div className="dlr-stat-card">
            <div className="dlr-stat-number" style={{ color: '#16a34a' }}>{stats.normal}</div>
            <div className="dlr-stat-label">Résultats normaux</div>
          </div>
          <div className="dlr-stat-card">
            <div className="dlr-stat-number" style={{ color: '#dc2626' }}>{stats.abnormal}</div>
            <div className="dlr-stat-label">Résultats anormaux</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="dlr-filters">
          <div className="dlr-search">
            <input
              type="text"
              className="dlr-search-input"
              placeholder="Rechercher par patient, analyse ou résultat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="dlr-filter-select"
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
            >
              <option value="all">Tous les patients</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
            <select
              className="dlr-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="normal">Normaux</option>
              <option value="abnormal">Anormaux</option>
            </select>
          </div>
        </div>

        {/* Tableau des résultats */}
        <div className="dlr-table">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Analyse</th>
                <th>Date</th>
                <th>Résultat</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    Aucun résultat d'analyse trouvé pour vos patients
                  </td>
                </tr>
              ) : (
                filteredResults.map(result => {
                  const resultClass = getResultClass(result.result);
                  const patient = result.patient;
                  
                  return (
                    <tr key={result._id}>
                      <td>
                        <div className="dlr-patient-info">
                          <div className="dlr-patient-avatar">
                            {getInitials(patient)}
                          </div>
                          <div>
                            <div className="dlr-patient-name">
                              {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${result.patientId}`}
                            </div>
                            <div className="dlr-patient-email">{patient?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{result.testName}</td>
                      <td>{formatDate(result.completedDate || result.date)}</td>
                      <td>
                        <div className="dlr-result-preview" title={result.result}>
                          {result.result}
                        </div>
                      </td>
                      <td>
                        <span className={`dlr-badge ${resultClass}`}>
                          {resultClass === 'normal' ? 'Normal' : 
                           resultClass === 'abnormal' ? 'Anormal' : 'À vérifier'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="dlr-view-btn"
                          onClick={() => handleViewResult(result)}
                        >
                          <i className="bi bi-eye" /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de détail */}
        {showModal && selectedResult && (
          <div className="dlr-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="dlr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dlr-modal-header">
                <h2 className="dlr-modal-title">Détail de l'analyse</h2>
                <button className="dlr-modal-close" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className="dlr-modal-patient">
                <strong>Patient :</strong> {selectedResult.patient?.firstName} {selectedResult.patient?.lastName}
                {selectedResult.patient?.email && <span style={{ color: '#94a3b8', marginLeft: '8px' }}>({selectedResult.patient.email})</span>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span className="dlr-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  {selectedResult.testName}
                </span>
                <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                  {formatDate(selectedResult.completedDate || selectedResult.date)}
                </span>
              </div>

              <div className={`dlr-modal-result ${getResultClass(selectedResult.result)}`}>
                {selectedResult.result}
              </div>

              <div className="dlr-modal-info">
                {selectedResult.referenceRange && (
                  <>
                    <div>
                      <div className="dlr-modal-label">Valeurs de référence</div>
                      <div className="dlr-modal-value">{selectedResult.referenceRange}</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="dlr-modal-label">Analysé par</div>
                  <div className="dlr-modal-value">{selectedResult.technician || 'Laboratoire'}</div>
                </div>
              </div>

              {selectedResult.notes && (
                <div className="dlr-modal-notes">
                  <i className="bi bi-info-circle" style={{ marginRight: '8px' }} />
                  {selectedResult.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DoctorLabResults;