import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .lt-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
  }

  .lt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .lt-title {
    font-size: 2rem;
    font-weight: 300;
    color: #0f172a;
    margin: 0;
  }
  .lt-subtitle {
    color: #64748b;
    margin-top: 4px;
  }

  .lt-btn {
    padding: 12px 24px;
    background: #9333ea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .lt-btn:hover { background: #7e22ce; }
  .lt-btn-success {
    background: #16a34a;
  }
  .lt-btn-success:hover { background: #15803d; }
  .lt-btn-warning {
    background: #ca8a04;
  }
  .lt-btn-warning:hover { background: #a16207; }

  .lt-filters {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .lt-search {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  .lt-search-input {
    flex: 1;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
  }
  .lt-filter-select {
    width: 200px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
  }

  .lt-table {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }
  .lt-table table {
    width: 100%;
    border-collapse: collapse;
  }
  .lt-table th {
    background: #f8fafc;
    padding: 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }
  .lt-table td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .lt-table tr:last-child td { border-bottom: none; }
  .lt-table tr:hover td { background: #f8fafc; }

  .lt-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  .lt-badge.pending { background: #fef9c3; color: #854d0e; }
  .lt-badge.completed { background: #dcfce7; color: #166534; }
  .lt-badge.urgent { background: #fee2e2; color: #991b1b; }

  .lt-btn-icon {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin: 0 4px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .lt-btn-icon.edit { background: #fef3c7; color: #92400e; }
  .lt-btn-icon.results { background: #dbeafe; color: #1e40af; }
  .lt-btn-icon.view { background: #e2e8f0; color: #334155; }
  .lt-btn-icon.complete { background: #dcfce7; color: #166534; }
  .lt-btn-icon.delete { background: #fee2e2; color: #dc2626; }

  .lt-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
`;

function LabTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    testName: '',
    priority: 'NORMAL',
    notes: ''
  });
  const [resultData, setResultData] = useState({
    result: '',
    referenceRange: '',
    notes: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchTerm, statusFilter, tests]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les analyses
      let testsData = [];
      try {
        const testsRes = await axios.get('http://localhost:8085/api/lab');
        testsData = testsRes.data;
        console.log('Analyses chargées:', testsData);
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

      setTests(testsData);
      setFilteredTests(testsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.testName?.toLowerCase().includes(term) ||
        t.patientId?.toString().includes(term) ||
        (patients[t.patientId] && `${patients[t.patientId].firstName} ${patients[t.patientId].lastName}`.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        filtered = filtered.filter(t => !t.status || t.status === 'PENDING');
      } else {
        filtered = filtered.filter(t => t.status === statusFilter);
      }
    }

    setFilteredTests(filtered);
  };

  const showMessage = (text) => {
    setShowSuccessMessage(text);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleAddTest = async () => {
    try {
      if (!formData.patientId || !formData.testName) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const newTest = {
        patientId: parseInt(formData.patientId),
        testName: formData.testName,
        priority: formData.priority,
        notes: formData.notes || '',
        date: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:8085/api/lab', newTest);
      console.log('Analyse créée:', response.data);
      
      await fetchData();
      setShowAddModal(false);
      resetForm();
      showMessage('✅ Analyse créée avec succès');
    } catch (err) {
      console.error('Erreur ajout:', err);
      alert('Erreur lors de la création de l\'analyse');
    }
  };

  // Version corrigée de handleMarkAsCompleted sans PUT sur toute la collection
  const handleMarkAsCompleted = async (test) => {
    try {
      if (!window.confirm(`Voulez-vous marquer cette analyse comme terminée ?`)) {
        return;
      }

      console.log('Mise à jour de l\'analyse:', test._id);

      // Utiliser PATCH pour mettre à jour partiellement (plus efficace que PUT sur toute la collection)
      const response = await axios.patch(`http://localhost:8085/api/lab/${test._id}`, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
        technician: `${user?.firstName || 'Agent'} ${user?.lastName || 'Laboratoire'}`
      });

      // Mettre à jour l'état local avec la réponse du serveur
      const updatedTests = tests.map(t => 
        t._id === test._id ? response.data : t
      );
      setTests(updatedTests);
      
      alert('✅ Analyse marquée comme terminée avec succès !');
      
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      
      if (err.response) {
        alert(`Erreur ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        alert('Le serveur ne répond pas. Vérifiez qu\'il est lancé sur le port 8085');
      } else {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  const handleDeleteTest = async (test) => {
    try {
      if (!window.confirm(`⚠️ Supprimer définitivement cette analyse ?\n\nPatient: ${getPatientDisplay(test.patientId)}\nAnalyse: ${test.testName}`)) {
        return;
      }

      // Utiliser DELETE individuel plutôt que PUT sur toute la collection
      await axios.delete(`http://localhost:8085/api/lab/${test._id}`);
      
      // Mettre à jour le state local
      setTests(tests.filter(t => t._id !== test._id));
      
      showMessage(`🗑️ Analyse supprimée`);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleAddResult = async () => {
    try {
      if (!resultData.result) {
        alert('Veuillez saisir le résultat');
        return;
      }

      // Utiliser PATCH pour mettre à jour partiellement
      const response = await axios.patch(`http://localhost:8085/api/lab/${selectedTest._id}`, {
        result: resultData.result,
        referenceRange: resultData.referenceRange || '',
        status: 'COMPLETED',
        technician: `${user?.firstName || 'Agent'} ${user?.lastName || 'Laboratoire'}`,
        completedDate: new Date().toISOString(),
        notes: resultData.notes || selectedTest.notes
      });

      // Mettre à jour l'état local
      const updatedTests = tests.map(t => 
        t._id === selectedTest._id ? response.data : t
      );
      setTests(updatedTests);

      setShowResultModal(false);
      setSelectedTest(null);
      setResultData({ result: '', referenceRange: '', notes: '' });
      showMessage(`✅ Résultat enregistré`);
      
    } catch (err) {
      console.error('Erreur ajout résultat:', err);
      alert('Erreur lors de l\'enregistrement du résultat');
    }
  };

  const openResultModal = (test) => {
    setSelectedTest(test);
    setResultData({
      result: '',
      referenceRange: '',
      notes: ''
    });
    setShowResultModal(true);
  };

  const resetForm = () => {
    setFormData({ patientId: '', testName: '', priority: 'NORMAL', notes: '' });
  };

  const getStatusBadge = (test) => {
    if (test.priority === 'URGENT' && !test.status) {
      return <span className="lt-badge urgent">URGENT</span>;
    }
    if (test.status === 'COMPLETED') {
      return <span className="lt-badge completed">Terminé</span>;
    }
    return <span className="lt-badge pending">En attente</span>;
  };

  const getPatientDisplay = (patientId) => {
    const patient = patients[patientId];
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Chargement...</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="lt-root">
        {/* Message de succès */}
        {showSuccessMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#dcfce7',
            color: '#166534',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1100,
            animation: 'slideIn 0.3s ease'
          }}>
            {showSuccessMessage}
          </div>
        )}

        <div className="lt-header">
          <div>
            <h1 className="lt-title">Analyses en cours</h1>
            <p className="lt-subtitle">
              {tests.filter(t => !t.status || t.status === 'PENDING').length} en attente • {tests.filter(t => t.status === 'COMPLETED').length} terminées
            </p>
          </div>
          <button className="lt-btn" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg" /> Nouvelle analyse
          </button>
        </div>

        <div className="lt-filters">
          <div className="lt-search">
            <input
              type="text"
              className="lt-search-input"
              placeholder="Rechercher par patient, analyse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="lt-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Terminé</option>
            </select>
          </div>
        </div>

        <div className="lt-table">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Analyse</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    Aucune analyse trouvée
                  </td>
                </tr>
              ) : (
                filteredTests.map(test => (
                  <tr key={test._id}>
                    <td>{getPatientDisplay(test.patientId)}</td>
                    <td>{test.testName}</td>
                    <td>{new Date(test.date).toLocaleDateString('fr-FR')}</td>
                    <td>{getStatusBadge(test)}</td>
                    <td>
                      <div className="lt-actions">
                        {/* Pour les analyses en attente */}
                        {(!test.status || test.status === 'PENDING') && (
                          <>
                            <button
                              className="lt-btn-icon complete"
                              onClick={() => handleMarkAsCompleted(test)}
                              title="Marquer comme terminé (sans résultat)"
                            >
                              <i className="bi bi-check-lg" /> Terminer
                            </button>
                            <button
                              className="lt-btn-icon results"
                              onClick={() => openResultModal(test)}
                              title="Saisir le résultat"
                            >
                              <i className="bi bi-pencil" /> Résultat
                            </button>
                          </>
                        )}
                        
                        {/* Pour les analyses terminées */}
                        {test.status === 'COMPLETED' && (
                          <Link to={`/lab/results?test=${test._id}`} className="lt-btn-icon view">
                            <i className="bi bi-eye" /> Voir
                          </Link>
                        )}
                        
                        {/* Bouton supprimer pour toutes les analyses */}
                        <button
                          className="lt-btn-icon delete"
                          onClick={() => handleDeleteTest(test)}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de création d'analyse */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              width: '500px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Nouvelle analyse</h3>
              
              <select
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              >
                <option value="">Sélectionner un patient</option>
                {Object.values(patients).map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nom de l'analyse"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                value={formData.testName}
                onChange={(e) => setFormData({...formData, testName: e.target.value})}
              />

              <select
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
              </select>

              <textarea
                placeholder="Notes"
                style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTest}
                  style={{ padding: '10px 20px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de saisie de résultat */}
        {showResultModal && selectedTest && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              width: '500px'
            }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Saisir le résultat</h3>
              
              <p style={{ marginBottom: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                <strong>Patient:</strong> {getPatientDisplay(selectedTest.patientId)}<br />
                <strong>Analyse:</strong> {selectedTest.testName}
              </p>

              <input
                type="text"
                placeholder="Résultat *"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                value={resultData.result}
                onChange={(e) => setResultData({...resultData, result: e.target.value})}
              />

              <input
                type="text"
                placeholder="Valeurs de référence (optionnel)"
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                value={resultData.referenceRange}
                onChange={(e) => setResultData({...resultData, referenceRange: e.target.value})}
              />

              <textarea
                placeholder="Notes supplémentaires (optionnel)"
                style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                value={resultData.notes}
                onChange={(e) => setResultData({...resultData, notes: e.target.value})}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedTest(null);
                  }}
                  style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddResult}
                  style={{ padding: '10px 20px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default LabTests;