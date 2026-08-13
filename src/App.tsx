import { useState, useEffect } from 'react';
import CameraTranslator from './components/CameraTranslator';
import Dictionary from './components/Dictionary';
import Store from './components/Store';

function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'diccionario' | 'tienda'>('inicio');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado y ejecutándose en modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstallable(false);
      return;
    } else {
      setIsInstallable(true);
    }

    // Detectar si es un dispositivo iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

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
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback si no hay deferredPrompt listo (ej. no es un contexto seguro HTTPS, u Opera/Chrome antes de disparar el evento)
      alert("Para instalar esta aplicación, haz clic en el botón de opciones o menú de tu navegador (⋮ o ⋯) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
      return;
    }
    
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

      {showIOSModal && (
        <div className="modal-overlay visible" onClick={() => setShowIOSModal(false)}>
          <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>📲</div>
            <h3 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
              Instalar en tu iPhone / iPad
            </h3>
            <p style={{ color: '#a0aec0', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem', textAlign: 'left' }}>
              Para instalar esta app en tu dispositivo iOS y utilizarla a pantalla completa y sin conexión:
              <br /><br />
              1. Presioná el botón de <strong>Compartir</strong> <span style={{fontSize:'1.1rem'}}>⎋</span> (en Safari) o de <strong>Opciones</strong> (en Chrome/Firefox) en la barra de tu navegador.
              <br /><br />
              2. Buscá y seleccioná la opción <strong>"Agregar a Inicio"</strong> (Add to Home Screen).
            </p>
            <button className="btn-cancelar" onClick={() => setShowIOSModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
