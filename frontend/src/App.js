

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Patient Components
import PatientDashboard from './components/patient/PatientDashboard';
import PatientAppointments from './components/patient/PatientAppointments';
import PatientPrescriptions from './components/patient/PatientPrescriptions';
import PatientMedications from './components/patient/PatientMedications';
import PatientLabResults from './components/patient/PatientLabResults';

// Doctor Components
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorAppointments from './components/doctor/DoctorAppointments';
import DoctorPrescriptions from './components/doctor/DoctorPrescriptions';
import DoctorPatients from './components/doctor/DoctorPatients';
import DoctorPatientDetail from './components/doctor/DoctorPatientDetail';
import DoctorLabResults from './components/doctor/DoctorLabResults';

// Reception Components
import ReceptionLayout from './components/reception/ReceptionLayout';
import ReceptionDashboard from './components/reception/ReceptionDashboard';
import ReceptionPatients from './components/reception/ReceptionPatients';
import ReceptionAppointments from './components/reception/ReceptionAppointments';
import ReceptionEHR from './components/reception/ReceptionEHR';

// Pharmacy Components
import PharmacyDashboard from './components/pharmacy/PharmacyDashboard';
import PharmacyMedications from './components/pharmacy/PharmacyMedications';
import PharmacyPrescriptions from './components/pharmacy/PharmacyPrescriptions';

// Lab Components
import LabDashboard from './components/lab/LabDashboard';
import LabTests from './components/lab/LabTests';
import LabResults from './components/lab/LabResults';

// Import des composants Billing
import BillingDashboard from './components/billing/BillingDashboard';
import BillingNewInvoice from './components/billing/BillingNewInvoice';
import BillingInvoiceDetail from './components/billing/BillingInvoiceDetail';

// Layouts
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Routes protégées - Patient */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="medications" element={<PatientMedications />} />
             <Route path="lab-results" element={<PatientLabResults />} /> 
          </Route>

          {/* Routes protégées - Médecin */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<DoctorPatientDetail />} />
            <Route path="lab-results" element={<DoctorLabResults />} />
          </Route>

          {/* Routes protégées - Réception */}
          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={['reception']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ReceptionDashboard />} />
            <Route path="patients" element={<ReceptionPatients />} />
            <Route path="appointments" element={<ReceptionAppointments />} />
            <Route path="ehr" element={<ReceptionEHR />} />
          </Route>

          {/* Routes protégées - Pharmacie */}
          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['pharmacy']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PharmacyDashboard />} />
            <Route path="medications" element={<PharmacyMedications />} />
            <Route path="prescriptions" element={<PharmacyPrescriptions />} />
          </Route>

          {/* Routes protégées - Laboratoire */}
          <Route path="/lab" element={
            <ProtectedRoute allowedRoles={['lab']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LabDashboard />} />
            <Route path="tests" element={<LabTests />} />
            <Route path="results" element={<LabResults />} />
          </Route>

          // Ajoutez ces routes dans la section des routes protégées
{/* Routes protégées - Facturation */}
<Route path="/billing" element={
  <ProtectedRoute allowedRoles={['billing', 'admin', 'reception']}>
    <MainLayout />
  </ProtectedRoute>
}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<BillingDashboard />} />
  <Route path="new" element={<BillingNewInvoice />} />
  <Route path=":id" element={<BillingInvoiceDetail />} />
</Route>

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function Unauthorized() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-1 text-danger">403</h1>
      <h3>Accès non autorisé</h3>
      <p>Vous n'avez pas les permissions pour accéder à cette page.</p>
      <a href="/login" className="btn btn-primary">Retour à la connexion</a>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-1 text-warning">404</h1>
      <h3>Page non trouvée</h3>
      <p>La page que vous recherchez n'existe pas.</p>
      <a href="/login" className="btn btn-primary">Retour à la connexion</a>
    </div>
  );
}

export default App;
