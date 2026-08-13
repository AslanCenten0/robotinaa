import React, { useState } from 'react';

const Store: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="store-view">
      <div className="intro-tienda">
        <h2>Conocé a Robotina</h2>
        <p>Nuestro robot traductor de LSA, en desarrollo por las alumnas de EET N° 24.</p>
      </div>

      <article className="tarjeta-producto animate-fade-in">
        <div className="foto-producto">
          <img src="/robotina.png" alt="Robotina, el robot traductor de LSA" />
        </div>
        <div className="info-producto">
          <span className="etiqueta-nueva">Nuevo</span>
          <h3>Robotina</h3>
          <p>
            Robot asistente y traductor de Lengua de Señas Argentina. Funciona con un ESP32 conectado a una pantalla LCD integrada que muestra en texto legible la traducción de la seña detectada por la cámara en tiempo real.
          </p>
          <ul>
            <li>Controlada por microcontrolador de alto rendimiento ESP32</li>
            <li>Pantalla LCD a color con la traducción instantánea a la vista</li>
            <li>Reconoce las 15 señas del Diccionario LSA oficial</li>
            <li>Carcasa y diseño hechos a mano por Girls Sign Tech</li>
          </ul>
          <div className="precio-producto">
            $45.000 <span>$60.000</span>
          </div>
          
          <div className="zona-comprar">
            <div className="sello-comprar" aria-hidden="true">
              <svg viewBox="0 0 160 160" width="118" height="118">
                <defs>
                  <path id="arcoSuperior" d="M 22 84 A 58 58 0 0 1 138 84" />
                </defs>
                <circle cx="80" cy="80" r="72" fill="#ffffff" stroke="#720026" strokeWidth="3" />
                <circle
                  cx="80"
                  cy="80"
                  r="61"
                  fill="none"
                  stroke="#720026"
                  strokeWidth="1.5"
                  strokeDasharray="2.5 4"
                />
                <text fontSize="8.5" fontWeight="700" fill="#720026" letterSpacing="2">
                  <textPath href="#arcoSuperior" startOffset="50%" textAnchor="middle">
                    GIRLS SIGN TECH
                  </textPath>
                </text>
                <path
                  d="M58 82 L72 96 L104 62"
                  stroke="#720026"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="80" y="118" fontSize="7.5" fontWeight="600" fill="#9c3f5e" textAnchor="middle" letterSpacing="1.2">
                  EET N° 24 · PROYECTO LSA
                </text>
              </svg>
            </div>
            <button className="btn-comprar" onClick={() => setModalOpen(true)}>
              🛒 ¡Comprar Robotina!
            </button>
          </div>
        </div>
      </article>

      {/* Modal Sin Stock */}
      <div className={`modal-overlay ${modalOpen ? 'visible' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
          <div className="modal-cara">:(</div>
          <div className="modal-texto">Actualmente no hay stock disponible</div>
          <button className="btn-cancelar" onClick={() => setModalOpen(false)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;
