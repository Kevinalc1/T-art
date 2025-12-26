import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import CookieConsent from './components/CookieConsent.jsx';

function App() {
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
      </div>
    </CurrencyProvider>
  );
}

export default App;
