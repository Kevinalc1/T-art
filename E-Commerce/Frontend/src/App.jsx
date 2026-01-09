import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import NewsletterPopup from './components/NewsletterPopup.jsx';
import { initializeAnalytics, trackPageView } from './utils/analytics.js';

function App() {
  const location = useLocation();

  // Initialize analytics once when app loads
  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return (
    <CurrencyProvider>
      <div style={{ minHeight: '100vh' }}>
        <ScrollToTop />
        <Header />
        <main style={{ paddingTop: '5rem' }}>
          {/* O React Router vai renderizar a página da rota atual aqui */}
          <Outlet />
        </main>
        <Footer />
        <CookieConsent />
        <WhatsAppButton />
        <NewsletterPopup />
      </div>
    </CurrencyProvider>
  );
}

export default App;
