import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import Aurora from './components/Aurora.jsx';

function App() {
  return (
    <CurrencyProvider>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
        <Aurora
          colorStops={["#133853", "#B99955", "#133853"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <ScrollToTop />
      <Header />
      <main>
        {/* O React Router vai renderizar a página da rota atual aqui */}
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </CurrencyProvider>
  );
}

export default App;
