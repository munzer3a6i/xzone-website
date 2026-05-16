import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

const Home = lazy(() => import('./pages/Home'));
const Work = lazy(() => import('./pages/Work'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Project = lazy(() => import('./pages/Project'));
const Admin = lazy(() => import('./pages/Admin'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-brand-red animate-spin" />
  </div>
);

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><Home /></PageWrapper></Suspense>} />
        <Route path="/work" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><Work /></PageWrapper></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><About /></PageWrapper></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><Contact /></PageWrapper></Suspense>} />
        <Route path="/project/:id" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><Project /></PageWrapper></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><PageWrapper><Admin /></PageWrapper></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
