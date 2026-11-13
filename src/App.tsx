import React from 'react';
import {
  ErrorState,
  OfflineIndicator,
  SkeletonBlock,
  ToastContainer,
} from './components/ui/Primitives';
import { AppProvider, useApp } from './context/AppContext';
import { AdminView } from './pages/admin/AdminView';
import { AuthPages } from './pages/institutional/AuthPages';
import { LandingPage } from './pages/institutional/LandingPage';
import { StatusPage } from './pages/institutional/StatusPages';
import { ProfessionalShell } from './pages/professional/ProfessionalShell';
import { PublicPaymentPage } from './pages/public/PublicPaymentPage';

const AppRouter: React.FC = () => {
  const { environment, loading, loadError, refreshSnapshot } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] p-6 max-w-5xl mx-auto space-y-4">
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorState message={loadError} onRetry={refreshSnapshot} />
        </div>
      </div>
    );
  }

  return (
    <>
      {environment === 'site' && <LandingPage />}
      {environment === 'auth' && <AuthPages />}
      {environment === 'professional' && <ProfessionalShell />}
      {environment === 'admin' && <AdminView />}
      {environment === 'public_payment' && <PublicPaymentPage />}
      {environment === 'confirmation' && <StatusPage mode="confirmation" />}
      {environment === 'error' && <StatusPage mode="error" />}
      <ToastContainer />
      <OfflineIndicator />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
