import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        {/* O React Router vai renderizar a página da rota atual aqui */}
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default App;
