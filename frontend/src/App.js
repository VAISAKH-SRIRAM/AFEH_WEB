import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/components/HomePage';
import BookingForm from '@/components/BookingForm';
import BookingSuccess from '@/components/BookingSuccess';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import PatientListPage from '@/components/PatientListPage';
import NurseDashboard from '@/components/NurseDashboard';
import VitalsForm from '@/components/VitalsForm';
import DoctorDashboard from '@/components/DoctorDashboard';
import ConsultationForm from '@/components/ConsultationForm';
import PatientRecordForm from '@/components/PatientRecordForm';
import OfflineIndicator from '@/components/OfflineIndicator';
import InstallPWA from '@/components/InstallPWA';
import PatientDetailsPage from '@/pages/PatientDetailsPage';
import { startPeriodicSync } from '@/lib/sync';
import './App.css';

function App() {
  useEffect(() => {
    // Start periodic sync
    startPeriodicSync();

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_DATA') {
          // Trigger sync when service worker requests it
          import('@/lib/sync').then(({ syncData }) => syncData());
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book-appointment" element={<BookingForm />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes (Ideally wrapped in a PrivateRoute component) */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/patient/:id" element={<PatientRecordForm />} />
            {/* Admin reusing booking form */}
            {/* Admin reusing booking form */}
            <Route path="/admin/book" element={<BookingForm />} />
            <Route path="/admin/patients" element={<PatientListPage />} />

            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/vitals/:id" element={<VitalsForm />} />

            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/consult/:id" element={<ConsultationForm />} />

            <Route path="/patient-details/:id" element={<PatientDetailsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
        <OfflineIndicator />
        <InstallPWA />
      </div>
    </AuthProvider>
  );
}

export default App;