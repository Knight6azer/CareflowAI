import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScanReport from './pages/ScanReport';
import MyReports from './pages/MyReports';
import ReportDetails from './pages/ReportDetails';
import About from './pages/About';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<ScanReport />} />
              <Route path="/reports" element={<MyReports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />
              <Route path="/about" element={<About />} />
              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
