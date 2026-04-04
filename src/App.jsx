import { Suspense } from 'react';
import { Router } from '@b1nd/aid-kit/navigation';
import { useSafeArea } from '@b1nd/aid-kit/safe-area-provider';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { routes } from './routes';
import Navbar from './components/Navbar';

export default function App() {
  const { loading } = useAuth();
  const { top, bottom } = useSafeArea();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen cu-empty">
        로딩 중...
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ paddingTop: top, paddingBottom: bottom }}>
        <Navbar />
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] cu-empty">로딩 중...</div>}>
          <Router routes={routes} />
        </Suspense>
      </div>
    </ToastProvider>
  );
}