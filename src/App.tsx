import { useState } from 'react';
import CameraTranslator from './components/CameraTranslator';
import Dictionary from './components/Dictionary';
import Store from './components/Store';

function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'diccionario' | 'tienda'>('inicio');

  return (
    <>
      <header>
        <div className="header-container">
          <div className="marca-header">
            {/* Ícono de mano estilizado (logotipo institucional) */}
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 26V14a3 3 0 0 1 6 0v8" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M20 22V10a3 3 0 0 1 6 0v12" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M26 22V12a3 3 0 0 1 6 0v13" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round"/>
              <path d="M32 25v-6a3 3 0 0 1 6 0v13c0 6.6-5.4 12-12 12h-4c-4 0-6.4-1.4-9-4.4l-7.6-8.8a3 3 0 0 1 4.4-4l4.2 3.8" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="marca-text">
              <span className="marca-title">Girls Sign Tech</span>
              <span className="marca-subtitle">EET N° 24</span>
            </div>
          </div>
          
          <h1>Traductor de Lengua de Señas Argentina (LSA)</h1>

          <nav>
            <button
              className={activeTab === 'inicio' ? 'activo' : ''}
              onClick={() => setActiveTab('inicio')}
            >
              Inicio
            </button>
            <button
              className={activeTab === 'diccionario' ? 'activo' : ''}
              onClick={() => setActiveTab('diccionario')}
            >
              Diccionario
            </button>
            <button
              className={activeTab === 'tienda' ? 'activo' : ''}
              onClick={() => setActiveTab('tienda')}
            >
              Tienda
            </button>
          </nav>
        </div>
      </header>

      <main>
        {activeTab === 'inicio' && <CameraTranslator />}
        {activeTab === 'diccionario' && <Dictionary />}
        {activeTab === 'tienda' && <Store />}
      </main>

      <footer>
        <p>EET N° 24 "Girls Sign Tech" · Prototipo de Migración SPA/PWA Cliente</p>
      </footer>
    </>
  );
}

export default App;
