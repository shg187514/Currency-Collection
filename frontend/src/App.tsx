import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';
import { Button } from './components/ui/Button';

const Workspace = lazy(() => import('./features/workspace/Workspace').then(m => ({ default: m.Workspace })));
const DesignSystemViewer = lazy(() => import('./features/DesignSystemViewer'));
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })));

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <h1 className="text-6xl font-bold mb-4 text-blue-600 dark:text-blue-500">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="animate-pulse text-gray-500">Loading My Currency Collection...</div></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Workspace />} />
            <Route path="node/:id" element={<Workspace />} />
          </Route>
          <Route path="/design" element={
            <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              <DesignSystemViewer />
            </div>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  );
}

export default App;
