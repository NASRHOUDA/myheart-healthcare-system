import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .bd-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  .bd-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .bd-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1;
  }
  .bd-subtitle { font-size: 0.82rem; color: #94a3b8; font-weight: 300; }

  .bd-stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .bd-stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .bd-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
  .bd-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
  }
  .bd-stat-icon.blue { background: #eff6ff; color: #2563eb; }
  .bd-stat-icon.green { background: #dcfce7; color: #059669; }
  .bd-stat-icon.yellow { background: #fef9c3; color: #ca8a04; }
  .bd-stat-icon.red { background: #fee2e2; color: #dc2626; }
  .bd-stat-icon.purple { background: #f3e8ff; color: #9333ea; }

  .bd-stat-number {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1;
    margin-bottom: 4px;
  }
  .bd-stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .bd-search {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .bd-search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
  }
  .bd-search-input:focus {
    border-color: #059669;
  }
  .bd-filter-select {
    width: 200px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    outline: none;
  }

  .bd-table {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
  }
  .bd-table table {
    width: 100%;
    border-collapse: collapse;
  }
  .bd-table th {
    background: #f8fafc;
    padding: 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }
  .bd-table td {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  .bd-table tr:last-child td { border-bottom: none; }
  .bd-table tr:hover td { background: #f8fafc; }

  .bd-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }
  .bd-badge.paid { background: #dcfce7; color: #166534; }
  .bd-badge.pending { background: #fef9c3; color: #854d0e; }
  .bd-badge.overdue { background: #fee2e2; color: #991b1b; }

  .bd-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    text-decoration: none;
  }
  .bd-btn-primary {
    background: #059669;
    color: white;
  }
  .bd-btn-primary:hover { background: #047857; }
  .bd-btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  .bd-btn-secondary:hover { background: #e2e8f0; }
  .bd-btn-danger {
    background: #fee2e2;
    color: #dc2626;
  }
  .bd-btn-danger:hover { background: #fecaca; }

  .bd-amount {
    font-weight: 600;
    color: #0f172a;
  }

  .bd-empty {
    text-align: center;
    padding: 60px;
    color: #94a3b8;
  }
  .bd-empty-icon { font-size: 48px; margin-bottom: 16px; }
`;

function BillingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [searchTerm, statusFilter, bills]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les factures
      let billsData = [];
      try {
        const billsRes = await axios.get('http://localhost:8083/api/bills');
        billsData = billsRes.data;
        console.log('Factures chargées:', billsData);
      } catch (err) {
        console.log('Service facturation non disponible');
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

      // Calculer les statistiques
      const total = billsData.length;
      const paid = billsData.filter(i => i.status === 'PAID').length;
      const pending = billsData.filter(i => i.status === 'PENDING').length;
      const revenue = billsData
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      setStats({ total, paid, pending, overdue: 0, revenue });
      setBills(billsData);
      setFilteredBills(billsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bill => {
        const patient = patients[bill.patientId];
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        return patientName.includes(term) ||
               bill.id?.toString().includes(term) ||
               bill.description?.toLowerCase().includes(term);
      });
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    setFilteredBills(filtered);
  };

  const getPatientName = (patientId) => {
    const patient = patients[patientId];
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PAID': { class: 'bd-badge paid', text: 'Payée', icon: '✓' },
      'PENDING': { class: 'bd-badge pending', text: 'En attente', icon: '⏳' }
    };
    const badge = badges[status] || { class: 'bd-badge pending', text: status, icon: '?' };
    return <span className={`bd-badge ${badge.class}`}>{badge.icon} {badge.text}</span>;
  };

  const handlePayment = async (billId) => {
    if (!window.confirm('Confirmer le paiement de cette facture ?')) return;
    
    try {
      await axios.put(`http://localhost:8083/api/bills/${billId}/pay?paymentMethod=CASH`);
      fetchData(); // Recharger les données
      alert('✅ Paiement enregistré avec succès');
    } catch (err) {
      console.error('Erreur paiement:', err);
      alert('Erreur lors du paiement');
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="bd-root">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#059669',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b' }}>Chargement des factures...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bd-root">
        {/* Header */}
        <div className="bd-header">
          <div>
            <h1 className="bd-title">Caisse / Facturation</h1>
            <p className="bd-subtitle">
              {user?.firstName} {user?.lastName} · Agent de caisse
            </p>
          </div>
          <Link to="/billing/new" className="bd-btn bd-btn-primary">
            <i className="bi bi-plus-lg" /> Nouvelle facture
          </Link>
        </div>

        {/* Statistiques */}
        <div className="bd-stats-grid">
          <div className="bd-stat-card">
            <div className="bd-stat-icon blue">
              <i className="bi bi-receipt" />
            </div>
            <div className="bd-stat-number">{stats.total}</div>
            <div className="bd-stat-label">Factures totales</div>
          </div>
          <div className="bd-stat-card">
            <div className="bd-stat-icon green">
              <i className="bi bi-check-circle" />
            </div>
            <div className="bd-stat-number">{stats.paid}</div>
            <div className="bd-stat-label">Payées</div>
          </div>
          <div className="bd-stat-card">
            <div className="bd-stat-icon yellow">
              <i className="bi bi-clock" />
            </div>
            <div className="bd-stat-number">{stats.pending}</div>
            <div className="bd-stat-label">En attente</div>
          </div>
          <div className="bd-stat-card">
            <div className="bd-stat-icon red">
              <i className="bi bi-exclamation-triangle" />
            </div>
            <div className="bd-stat-number">{stats.overdue}</div>
            <div className="bd-stat-label">En retard</div>
          </div>
          <div className="bd-stat-card">
            <div className="bd-stat-icon purple">
              <i className="bi bi-currency-euro" />
            </div>
            <div className="bd-stat-number">{formatCurrency(stats.revenue)}</div>
            <div className="bd-stat-label">Chiffre d'affaires</div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bd-search">
          <i className="bi bi-search" style={{ color: '#94a3b8' }} />
          <input
            type="text"
            className="bd-search-input"
            placeholder="Rechercher par patient, numéro de facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bd-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PAID">Payées</option>
            <option value="PENDING">En attente</option>
          </select>
        </div>

        {/* Tableau des factures */}
        <div className="bd-table">
          <table>
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="bd-empty">
                    <div className="bd-empty-icon">🧾</div>
                    <div>Aucune facture trouvée</div>
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id}>
                    <td>
                      <strong>#{bill.id}</strong>
                    </td>
                    <td>{getPatientName(bill.patientId)}</td>
                    <td>{formatDate(bill.createdAt)}</td>
                    <td>{bill.description || 'Consultation / Prestation'}</td>
                    <td className="bd-amount">{formatCurrency(bill.amount)}</td>
                    <td>{getStatusBadge(bill.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="bd-btn bd-btn-secondary"
                          onClick={() => navigate(`/billing/${bill.id}`)}
                        >
                          <i className="bi bi-eye" /> Détails
                        </button>
                        {bill.status !== 'PAID' && (
                          <button
                            className="bd-btn bd-btn-primary"
                            onClick={() => handlePayment(bill.id)}
                          >
                            <i className="bi bi-credit-card" /> Payer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default BillingDashboard;