import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages to drastically reduce the initial JavaScript bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ParticipantsPage = lazy(() => import('./pages/ParticipantsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Loading...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/participants" element={<ParticipantsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}
