import { useState, useEffect } from 'react';
import CameraTranslator from './components/CameraTranslator';
import Dictionary from './components/Dictionary';
import Store from './components/Store';

function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'diccionario' | 'tienda'>('inicio');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado y ejecutándose en modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Evitar que aparezca el banner nativo por defecto en dispositivos móviles
      e.preventDefault();
      // Guardar el evento de instalación para dispararlo luego
      setDeferredPrompt(e);
      // Mostrar nuestro botón de instalación
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      // Limpiar el prompt diferido
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('La PWA ha sido instalada exitosamente.');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar el prompt de instalación nativo
    deferredPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Elección del usuario respecto a la instalación: ${outcome}`);
    
    // El prompt solo puede ser usado una vez, lo descartamos
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

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
            {isInstallable && (
              <button className="btn-instalar" onClick={handleInstallClick}>
                📲 Descargar App
              </button>
            )}
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
