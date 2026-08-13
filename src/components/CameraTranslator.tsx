import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyHandPostur, type Landmark } from '../utils/gestureClassifier';
import { serialConnection } from '../utils/serialConnection';
import { Volume2, Trash2, Delete, Wifi, RefreshCw } from 'lucide-react';

const FRAMES_REQUERIDOS = 4;
const UMBRAL_ZONA_ARRIBA = 0.45;

const CameraTranslator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados de carga e interfaz
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('Iniciando...');
  const [cameraActive, setCameraActive] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialSupported] = useState(serialConnection.isSupported());

  // Estados del traductor
  const [gestoDetectado, setGestoDetectado] = useState('Esperando...');
  const [historialFrase, setHistorialFrase] = useState<string[]>([]);
  const [modoSecreto67, setModoSecreto67] = useState(false);

  // Variables de control persistentes entre frames
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const isLoopingRef = useRef(false);

  // Colas/Histeresis en refs para evitar re-renderizados innecesarios por frame
  const historialX = useRef<number[]>([]);
  const historialY = useRef<number[]>([]);
  const historialArea = useRef<number[]>([]);
  const historialPostura = useRef<(string | null)[]>([]);

  const ultimoEnvio = useRef<string>('');
  const bloqueadoHasta = useRef<number>(0);
  const mostrarTextoHasta = useRef<number>(0);
  const gestoFijado = useRef<string>('');
  const gestoCandidato = useRef<string>('Ninguno');
  const contadorEstabilidad = useRef<number>(0);

  // Carga inicial de MediaPipe HandLandmarker
  useEffect(() => {
    const initializeLandmarker = async () => {
      try {
        setLoadingProgress('Cargando resolutores WASM...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        setLoadingProgress('Descargando modelo de mano...');
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker_full/float16/latest/hand_landmarker_full.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        landmarkerRef.current = landmarker;
        setModelLoaded(true);
        console.log('MediaPipe Landmarker inicializado con éxito.');
      } catch (err) {
        console.error('Error al inicializar MediaPipe:', err);
        setLoadingProgress('Error al cargar MediaPipe. Reintente.');
      }
    };

    initializeLandmarker();

    return () => {
      isLoopingRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Activa o desactiva la cámara
  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setCameraActive(true);
        isLoopingRef.current = true;
        requestRef.current = requestAnimationFrame(processingLoop);
      };
    } catch (err) {
      console.error('Error al abrir la cámara:', err);
      alert('No se pudo acceder a la cámara. Asegúrese de otorgar los permisos correspondientes.');
    }
  };

  const stopCamera = () => {
    isLoopingRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);

    // Limpiar canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Sonido sintetizado del modo secreto 67 (Web Audio API)
  const sonido67 = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
      ganancia.gain.setValueAtTime(0.28, ctx.currentTime);
      ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(ganancia).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext bloqueado por interacción del usuario.');
    }
  };

  // Animación del modo secreto 67
  const trigger67Animation = () => {
    // Sonido
    sonido67();

    // Sacudida
    document.body.classList.add('sacudiendo-67');
    setTimeout(() => document.body.classList.remove('sacudiendo-67'), 400);

    // Destello de fondo
    const flash = document.createElement('div');
    flash.className = 'flash-67';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    // Sello gigante
    const sello = document.createElement('div');
    sello.className = 'sello-67-gigante';
    sello.textContent = '¡67!';
    document.body.appendChild(sello);
    setTimeout(() => sello.remove(), 900);

    // Lluvia de símbolos
    const simbolos = ['67', '67', '67', '⚡', '🔥'];
    const cantidad = 34;
    for (let i = 0; i < cantidad; i++) {
      const el = document.createElement('div');
      el.className = 'numero-67';
      el.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
      el.style.left = Math.random() * 96 + 'vw';
      el.style.fontSize = 1.6 + Math.random() * 2.4 + 'rem';
      el.style.animationDuration = 1.4 + Math.random() * 1.3 + 's';
      el.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2700);
    }
  };

  // Suaviza la postura utilizando la más común en los últimos frames
  const getSmoothedPosture = (historial: (string | null)[]): string | null => {
    const list = historial.filter((p) => p !== null) as string[];
    if (list.length === 0) return null;
    const occurrences: Record<string, number> = {};
    let maxCount = 0;
    let mostFrequent: string | null = null;
    list.forEach((val) => {
      occurrences[val] = (occurrences[val] || 0) + 1;
      if (occurrences[val] > maxCount) {
        maxCount = occurrences[val];
        mostFrequent = val;
      }
    });
    return mostFrequent;
  };

  // Bucle de procesamiento de frames
  const processingLoop = async (timestamp: number) => {
    if (!isLoopingRef.current || !videoRef.current || !canvasRef.current || !landmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Ajustar dimensiones del canvas si es necesario
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Procesar frame con MediaPipe
      const results = landmarkerRef.current.detectForVideo(video, timestamp);

      const tiempoActual = Date.now() / 1000;
      let gestoActualFrame = 'Esperando...';

      if (tiempoActual < mostrarTextoHasta.current) {
        // Muestra el gesto fijado durante el lock
        setGestoDetectado(gestoFijado.current);
      } else {
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0] as Landmark[];

          // 1. Dibujar landmarks y conexiones de la mano en el canvas
          drawHand(ctx, landmarks);

          if (modoSecreto67) {
            // MODO SECRETO 67: Ignora clasificación e identifica agitación vertical
            historialY.current.push(landmarks[9].y);
            if (historialY.current.length > 10) historialY.current.shift();

            let cambiosDireccionY = 0;
            if (historialY.current.length === 10) {
              let direccionActualY = 0;
              for (let i = 1; i < historialY.current.length; i++) {
                const diffY = historialY.current[i] - historialY.current[i - 1];
                if (Math.abs(diffY) > 0.025) {
                  const nuevaDirY = diffY > 0 ? 1 : -1;
                  if (direccionActualY !== 0 && nuevaDirY !== direccionActualY) {
                    cambiosDireccionY += 1;
                  }
                  direccionActualY = nuevaDirY;
                }
              }
            }

            if (cambiosDireccionY >= 1) {
              gestoActualFrame = '67';
            }
          } else {
            // MODO NORMAL: Clasificación geométrica
            const postureRaw = classifyHandPostur(landmarks);
            historialPostura.current.push(postureRaw);
            if (historialPostura.current.length > 3) historialPostura.current.shift();
            const postura = getSmoothedPosture(historialPostura.current);

            // Centro X según la pose
            const centroX = postura === 'INDICE' ? landmarks[8].x : landmarks[9].x;
            historialX.current.push(centroX);
            if (historialX.current.length > 10) historialX.current.shift();

            // Calcular área aproximada de la mano
            let minX = 1, maxX = 0, minY = 1, maxY = 0;
            landmarks.forEach((lm) => {
              if (lm.x < minX) minX = lm.x;
              if (lm.x > maxX) maxX = lm.x;
              if (lm.y < minY) minY = lm.y;
              if (lm.y > maxY) maxY = lm.y;
            });
            const areaMano = (maxX - minX) * (maxY - minY);
            historialArea.current.push(areaMano);
            if (historialArea.current.length > 10) historialArea.current.shift();

            const anchoManoNorm = Math.max(maxX - minX, 0.01);

            // Calcular cambios de dirección horizontal
            let cambiosDireccionX = 0;
            if (historialX.current.length === 10) {
              let direccionActualX = 0;
              for (let i = 1; i < historialX.current.length; i++) {
                const diffX = historialX.current[i] - historialX.current[i - 1];
                const factorUmbral = postura === 'INDICE' ? 0.05 : 0.10;
                const umbral = anchoManoNorm * factorUmbral;
                if (Math.abs(diffX) > umbral) {
                  const nuevaDirX = diffX > 0 ? 1 : -1;
                  if (direccionActualX !== 0 && nuevaDirX !== direccionActualX) {
                    cambiosDireccionX += 1;
                  }
                  direccionActualX = nuevaDirX;
                }
              }
            }

            // Distinción de la zona vertical (Cerca de cara vs. Pecho)
            const zonaArriba = landmarks[9].y < UMBRAL_ZONA_ARRIBA;

            // Decisiones de gestos
            if (postura === 'INDICE' && cambiosDireccionX >= 1) {
              gestoActualFrame = 'NO';
            } else if (postura === 'ILY_TEQUIERO') {
              gestoActualFrame = 'TE QUIERO';
            } else if (postura === 'PULGAR_ARRIBA') {
              gestoActualFrame = 'AYUDA';
            } else if (postura === 'MENIQUE_ARRIBA') {
              gestoActualFrame = 'SI';
            } else if (postura === 'V_MEDICO') {
              gestoActualFrame = 'MEDICO';
            } else if (postura === 'W_AGUA' && cambiosDireccionX === 0) {
              gestoActualFrame = 'AGUA';
            } else if (postura === 'GANCHO_NECESITO') {
              gestoActualFrame = 'NECESITO';
            } else if (postura === 'PINZA' && cambiosDireccionX === 0) {
              gestoActualFrame = zonaArriba ? 'COMIDA' : 'PERDON';
            } else if (postura === 'MANO_ABIERTA') {
              if (cambiosDireccionX >= 3) {
                gestoActualFrame = 'ADIOS';
              } else if (cambiosDireccionX >= 2) {
                gestoActualFrame = 'HOLA';
              } else if (historialArea.current.length === 10 && cambiosDireccionX === 0) {
                // Si el área final es un 15% mayor que la inicial, avanza hacia la cámara (GRACIAS)
                if (historialArea.current[9] > historialArea.current[0] * 1.15) {
                  gestoActualFrame = 'GRACIAS';
                } else {
                  gestoActualFrame = zonaArriba ? 'BAÑO' : 'POR FAVOR';
                }
              }
            }
          }
        } else {
          // Limpiar deques si no hay mano
          historialX.current = [];
          historialY.current = [];
          historialArea.current = [];
          historialPostura.current = [];
        }

        // Histeresis de confirmación
        if (gestoActualFrame === gestoCandidato.current && gestoActualFrame !== 'Esperando...') {
          contadorEstabilidad.current += 1;
        } else {
          gestoCandidato.current = gestoActualFrame;
          contadorEstabilidad.current = 0;
        }

        if (contadorEstabilidad.current >= FRAMES_REQUERIDOS) {
          const gestoConfirmado = gestoCandidato.current;
          gestoFijado.current = gestoConfirmado;
          setGestoDetectado(gestoConfirmado);

          // Bloquear durante 5 segundos
          mostrarTextoHasta.current = tiempoActual + 5.0;
          bloqueadoHasta.current = tiempoActual + 5.0;
          contadorEstabilidad.current = 0;

          // Añadir a historial
          setHistorialFrase((prev) => [...prev, gestoConfirmado]);

          // Trigger visual secreto si es 67
          if (gestoConfirmado === '67') {
            trigger67Animation();
          }

          // Envío serial
          if (serialConnection.isConnected() && gestoConfirmado !== ultimoEnvio.current) {
            serialConnection.write(`${gestoConfirmado}\n`);
            ultimoEnvio.current = gestoConfirmado;
          }
        } else {
          // Expirar e ir a "Esperando..."
          setGestoDetectado('Esperando...');
          if (
            serialConnection.isConnected() &&
            ultimoEnvio.current !== 'Esperando...' &&
            tiempoActual >= bloqueadoHasta.current
          ) {
            serialConnection.write('CLEAR\n');
            ultimoEnvio.current = 'Esperando...';
          }
        }
      }
    }

    requestRef.current = requestAnimationFrame(processingLoop);
  };

  // Función de dibujado de manos
  const drawHand = (ctx: CanvasRenderingContext2D, landmarks: Landmark[]) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // pulgar
      [0, 5], [5, 6], [6, 7], [7, 8], // índice
      [5, 9], [9, 10], [10, 11], [11, 12], // medio
      [9, 13], [13, 14], [14, 15], [15, 16], // anular
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17], // meñique
    ];

    // Conexiones
    ctx.strokeStyle = '#720026';
    ctx.lineWidth = 4;
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    });

    // Puntos
    ctx.fillStyle = '#ffffff';
    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * ctx.canvas.width, pt.y * ctx.canvas.height, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#720026';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  // Controladores del historial
  const borrarUltimo = () => {
    setHistorialFrase((prev) => prev.slice(0, -1));
  };

  const limpiarTodo = () => {
    setHistorialFrase([]);
  };

  const leerEnVozAlta = () => {
    const frase = historialFrase.join(' ');
    if (!frase) return;
    if (!('speechSynthesis' in window)) {
      alert('Este navegador no soporta lectura en voz alta.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(frase);
    utterance.lang = 'es-AR';
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Controladores de conexión serial
  const toggleSerial = async () => {
    if (serialConnected) {
      await serialConnection.disconnect();
      setSerialConnected(false);
    } else {
      const connected = await serialConnection.connect();
      setSerialConnected(connected);
    }
  };

  return (
    <div className="translator-view">
      {/* Botón invisible para activar el modo secreto 67 */}
      <button
        className="btn-secreto-67"
        onClick={() => setModoSecreto67((prev) => !prev)}
        aria-label="Toggle secret mode 67"
      />

      {!modelLoaded ? (
        <div
          className="card-premium"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            gap: '1rem',
          }}
        >
          <RefreshCw className="animate-spin" size={40} color="#720026" />
          <p style={{ fontWeight: 600 }}>{loadingProgress}</p>
        </div>
      ) : (
        <div className="translator-grid">
          {/* Panel de Video e Interfaz de Control */}
          <section className="card-premium panel-video">
            <div className="video-container">
              <video
                ref={videoRef}
                className="video-feed"
                playsInline
                muted
                style={{ display: cameraActive ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} className="canvas-feed" />

              {!cameraActive && (
                <div style={{ textAlign: 'center', zIndex: 2 }}>
                  <p style={{ marginBottom: '1rem', color: '#a0aec0' }}>
                    La cámara está desactivada
                  </p>
                  <button
                    className="btn-audio"
                    style={{ border: 'none', padding: '0.8rem 2rem', borderRadius: '99px' }}
                    onClick={startCamera}
                  >
                    Activar Cámara
                  </button>
                </div>
              )}
            </div>

            {cameraActive && (
              <div className="controls-overlay">
                <div className="camera-badge">
                  <div className="badge-dot active" />
                  <span>EN VIVO</span>
                </div>
                <button className="btn-serial" onClick={stopCamera}>
                  Detener
                </button>
              </div>
            )}
          </section>

          {/* Panel Lateral de Datos */}
          <section className="panel-right">
            <div className="card-premium tarjeta-estado">
              <h2>Traducción Confirmada</h2>
              <div
                className={`valor-gesto ${
                  gestoDetectado !== 'Esperando...' ? 'actualizado' : ''
                }`}
              >
                {gestoDetectado}
              </div>
            </div>

            {/* Configuración de Hardware */}
            {serialSupported && (
              <div className="card-premium panel-serial">
                <div className="serial-info">
                  <span className="serial-title">
                    <Wifi size={16} color={serialConnected ? '#38a169' : '#e53e3e'} />
                    Conexión Serial ESP32
                  </span>
                  <span className="serial-status-text">
                    {serialConnected
                      ? 'Conectado a puerto COM'
                      : 'Detecta y envía señas al hardware externo'}
                  </span>
                </div>
                <button
                  className={`btn-serial ${serialConnected ? 'connected' : ''}`}
                  onClick={toggleSerial}
                >
                  {serialConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            )}

            {/* Historial de la Frase */}
            <div className="card-premium panel-historial">
              <h2>Historial de la frase</h2>
              <textarea
                className="textarea-historial"
                readOnly
                value={historialFrase.join(' ')}
                placeholder="Las señas confirmadas van a ir apareciendo acá..."
              />
              <div className="botones-historial">
                <button className="btn-historial btn-borrar" onClick={borrarUltimo}>
                  <Delete size={16} />
                  Borrar palabra
                </button>
                <button className="btn-historial btn-limpiar" onClick={limpiarTodo}>
                  <Trash2 size={16} />
                  Limpiar todo
                </button>
                <button className="btn-historial btn-audio" onClick={leerEnVozAlta}>
                  <Volume2 size={16} />
                  Leer en voz alta
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CameraTranslator;
