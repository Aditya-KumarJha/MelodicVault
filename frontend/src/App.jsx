import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthUser } from './store/authSlice';

// Core Components (Non-lazy for stability)
import ProtectedRoute from './pages/auth/ProtectedRoute';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/home').then((m) => ({ default: m.HomePage })));
const DashboardPage = lazy(() => import('./pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const SignInPage = lazy(() => import('./pages/auth').then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/auth').then((m) => ({ default: m.SignUpPage })));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));

// UI Components
const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl border-[3px] border-black bg-white/70 ${className}`} />
);

export const AppSkeleton = () => (
  <main
    className="min-h-screen bg-[#1E6BFF] p-4 font-sans text-slate-950 sm:p-6"
    style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
      backgroundSize: '34px 34px',
    }}
  >
    <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden rounded-2xl border-[4px] border-black bg-[#00E676] p-4 shadow-[8px_8px_0_#0F172A] lg:grid lg:content-start lg:gap-4">
        <SkeletonBlock className="h-12 w-36 bg-white/80" />
        <SkeletonBlock className="h-10" />
        <SkeletonBlock className="h-10" />
      </aside>
      <section className="grid content-start gap-4">
        <header className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_#0F172A]">
          <SkeletonBlock className="h-12 w-full bg-slate-100" />
        </header>
        <SkeletonBlock className="h-80 bg-white" />
      </section>
    </div>
  </main>
);

const App = () => {
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(checkAuthUser());
  }, [dispatch]);

  return (
    <Suspense fallback={<AppSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        

        <Route path="/signin" element={<ProtectedRoute><SignInPage /></ProtectedRoute>} />
        <Route path="/signup" element={<ProtectedRoute><SignUpPage /></ProtectedRoute>} />
        <Route path="/reset-password" element={<RecoverPassword />} />
        
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route
          path="/dashboard/:view"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
