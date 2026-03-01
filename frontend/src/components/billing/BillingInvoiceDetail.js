import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .bid-root {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  .bid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .bid-title {
    font-size: 2rem;
    font-weight: 300;
    color: #0f172a;
    margin: 0;
  }

  .bid-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
  }

  .bid-invoice-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #e2e8f0;
  }
  .bid-invoice-number {
    font-size: 1.5rem;
    font-weight: 600;
    color: #059669;
  }
  .bid-invoice-date {
    color: #64748b;
  }

  .bid-patient-info {
    margin-bottom: 32px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
  }
  .bid-patient-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .bid-items {
    margin-bottom: 32px;
  }
  .bid-items table {
    width: 100%;
    border-collapse: collapse;
  }
  .bid-items th {
    text-align: left;
    padding: 12px;
    background: #f1f5f9;
    font-size: 0.9rem;
    color: #475569;
  }
  .bid-items td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .bid-total {
    text-align: right;
    font-size: 1.3rem;
    font-weight: 600;
    color: #059669;
    margin: 24px 0;
    padding: 16px;
    background: #f0fdf4;
    border-radius: 12px;
  }

  .bid-notes {
    background: #fff7ed;
    border-radius: 12px;
    padding: 16px;
    margin: 24px 0;
    color: #9a3412;
  }

  .bid-status {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .bid-status.paid { background: #dcfce7; color: #166534; }
  .bid-status.pending { background: #fef9c3; color: #854d0e; }

  .bid-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  .bid-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .bid-btn-primary {
    background: #059669;
    color: white;
  }
  .bid-btn-primary:hover { background: #047857; }
  .bid-btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  .bid-btn-secondary:hover { background: #e2e8f0; }
`;

function BillingInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bill, setBill] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      
      // Récupérer la facture
      const billRes = await axios.get(`http://localhost:8083/api/bills/${id}`);
      setBill(billRes.data);

      // Récupérer les infos du patient
      const patientRes = await axios.get(`http://localhost:8081/api/patients/${billRes.data.patientId}`);
      setPatient(patientRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement facture:', err);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!window.confirm('Confirmer le paiement de cette facture ?')) return;
    
    try {
      await axios.put(`http://localhost:8083/api/bills/${id}/pay?paymentMethod=CASH`);
      alert('✅ Paiement enregistré avec succès');
      fetchBill(); // Recharger
    } catch (err) {
      console.error('Erreur paiement:', err);
      alert('Erreur lors du paiement');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PAID': 'bid-status paid',
      'PENDING': 'bid-status pending'
    };
    const labels = {
      'PAID': 'Payée',
      'PENDING': 'En attente'
    };
    return <span className={badges[status] || 'bid-status pending'}>{labels[status] || status}</span>;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="bid-root">
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
            <p style={{ color: '#64748b' }}>Chargement de la facture...</p>
          </div>
        </div>
      </>
    );
  }

  if (!bill) {
    return (
      <>
        <style>{styles}</style>
        <div className="bid-root">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>Facture non trouvée</h2>
            <Link to="/billing" className="bid-btn bid-btn-secondary">
              Retour à la liste
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bid-root">
        <div className="bid-header">
          <h1 className="bid-title">Détail de la facture</h1>
          <Link to="/billing" className="bid-btn bid-btn-secondary">
            <i className="bi bi-arrow-left" /> Retour
          </Link>
        </div>

        <div className="bid-card">
          <div className="bid-invoice-header">
            <div>
              <div className="bid-invoice-number">Facture #{bill.id}</div>
              <div className="bid-invoice-date">Créée le {formatDate(bill.createdAt)}</div>
            </div>
            <div>{getStatusBadge(bill.status)}</div>
          </div>

          {patient && (
            <div className="bid-patient-info">
              <div className="bid-patient-name">{patient.firstName} {patient.lastName}</div>
              <div style={{ color: '#64748b' }}>
                <div>Email: {patient.email}</div>
                {patient.phone && <div>Tél: {patient.phone}</div>}
              </div>
            </div>
          )}

          <div className="bid-items">
            <h3 style={{ marginBottom: 16 }}>Détail</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{bill.description || 'Prestation médicale'}</td>
                  <td>{formatCurrency(bill.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bid-total">
            Total: {formatCurrency(bill.amount)}
          </div>

          <div className="bid-actions">
            {bill.status !== 'PAID' && (
              <button className="bid-btn bid-btn-primary" onClick={handlePayment}>
                <i className="bi bi-credit-card" /> Enregistrer le paiement
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BillingInvoiceDetail;