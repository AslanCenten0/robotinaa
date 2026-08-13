import React from 'react';

interface HandIconProps {
  dedos: [number, number, number, number, number]; // [pulgar, indice, medio, anular, menique]
  movimiento?: 'lateral' | 'lateral_rapido' | 'adelante' | null;
}

export const HandIcon: React.FC<HandIconProps> = ({ dedos, movimiento }) => {
  const [pulgar, indice, medio, anular, menique] = dedos;

  const renderDedo = (
    x: number,
    y: number,
    angulo: number,
    extendido: boolean,
    longitudExt = 46,
    longitudCerr = 13,
    ancho = 13
  ) => {
    const largo = extendido ? longitudExt : longitudCerr;
    const relleno = extendido ? '#faedf1' : '#e7c3ce';
    return (
      <g transform={`translate(${x},${y}) rotate(${angulo})`}>
        <rect
          x={-ancho / 2}
          y={-largo}
          width={ancho}
          height={largo}
          rx={ancho / 2}
          fill={relleno}
          stroke="#720026"
          strokeWidth="2"
        />
      </g>
    );
  };

  const renderFlecha = () => {
    if (movimiento === 'lateral') {
      return (
        <text x="60" y="34" fontSize="22" fill="#9c3f5e" textAnchor="middle">
          ↔
        </text>
      );
    } else if (movimiento === 'lateral_rapido') {
      return (
        <text x="60" y="34" fontSize="19" fill="#720026" fontWeight="700" textAnchor="middle">
          ↔ ↔
        </text>
      );
    } else if (movimiento === 'adelante') {
      return (
        <text x="60" y="34" fontSize="22" fill="#9c3f5e" textAnchor="middle">
          →
        </text>
      );
    }
    return null;
  };

  return (
    <svg viewBox="0 0 120 165" width="72" height="99">
      {renderFlecha()}
      <rect
        x="30"
        y="100"
        width="60"
        height="52"
        rx="18"
        fill="#faedf1"
        stroke="#720026"
        strokeWidth="2.2"
      />
      {renderDedo(40, 100, -10, !!menique)}
      {renderDedo(54, 100, -3, !!anular)}
      {renderDedo(68, 100, 3, !!medio)}
      {renderDedo(82, 100, 9, !!indice)}
      {renderDedo(28, 118, -55, !!pulgar, 38, 10, 14)}
    </svg>
  );
};

export const IconoNecesito: React.FC = () => (
  <svg viewBox="0 0 120 165" width="72" height="99">
    <rect x="30" y="100" width="60" height="52" rx="18" fill="#faedf1" stroke="#720026" strokeWidth="2.2" />
    <rect x="33" y="86" width="13" height="14" rx="6.5" fill="#e7c3ce" stroke="#720026" strokeWidth="2" />
    <rect x="47" y="97" width="13" height="14" rx="6.5" fill="#e7c3ce" stroke="#720026" strokeWidth="2" />
    <rect x="61" y="97" width="13" height="14" rx="6.5" fill="#e7c3ce" stroke="#720026" strokeWidth="2" />
    <g transform="translate(28,118) rotate(-55)">
      <rect x="-7" y="-10" width="14" height="10" rx="5" fill="#e7c3ce" stroke="#720026" strokeWidth="2" />
    </g>
    <path
      d="M80 100 C80 80 93 79 93 64 C93 53 84 49 79 57"
      fill="none"
      stroke="#720026"
      strokeWidth="9"
      strokeLinecap="round"
    />
  </svg>
);

export const IconoPinza: React.FC = () => (
  <svg viewBox="0 0 120 165" width="72" height="99">
    <rect x="30" y="100" width="60" height="52" rx="18" fill="#faedf1" stroke="#720026" strokeWidth="2.2" />
    <path d="M40 100 L60 55" stroke="#720026" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M52 100 L60 55" stroke="#720026" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M68 100 L60 55" stroke="#720026" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M80 100 L60 55" stroke="#720026" strokeWidth="6.5" strokeLinecap="round" />
    <g transform="translate(28,118) rotate(-70)">
      <rect x="-7" y="-38" width="14" height="38" rx="7" fill="#faedf1" stroke="#720026" strokeWidth="2" />
    </g>
    <circle cx="60" cy="53" r="4.5" fill="#720026" />
  </svg>
);

export interface SenaItem {
  nombre: string;
  descripcion: string;
  renderIcono: () => React.ReactNode;
}

export const SENAS_DICCIONARIO: SenaItem[] = [
  {
    nombre: 'NO',
    descripcion: 'Dedo índice levantado, resto del puño cerrado. Agitar de lado a lado.',
    renderIcono: () => <HandIcon dedos={[0, 1, 0, 0, 0]} movimiento="lateral" />,
  },
  {
    nombre: 'AYUDA',
    descripcion: 'Puño cerrado con el pulgar hacia arriba, estático.',
    renderIcono: () => <HandIcon dedos={[1, 0, 0, 0, 0]} />,
  },
  {
    nombre: 'SI',
    descripcion: 'Puño cerrado con el dedo meñique levantado, estático.',
    renderIcono: () => <HandIcon dedos={[0, 0, 0, 0, 1]} />,
  },
  {
    nombre: 'HOLA',
    descripcion: 'Mano abierta (palma al frente) agitando suavemente de lado a lado.',
    renderIcono: () => <HandIcon dedos={[1, 1, 1, 1, 1]} movimiento="lateral" />,
  },
  {
    nombre: 'GRACIAS',
    descripcion: 'Mano abierta avanzando directo hacia el centro de la cámara.',
    renderIcono: () => <HandIcon dedos={[1, 1, 1, 1, 1]} movimiento="adelante" />,
  },
  {
    nombre: 'POR FAVOR',
    descripcion: 'Mano plana y vertical, manteniéndola estable.',
    renderIcono: () => <HandIcon dedos={[1, 1, 1, 1, 1]} />,
  },
  {
    nombre: 'PERDÓN',
    descripcion: 'Las yemas de los 5 dedos tocándose entre sí (forma de capullo/pico).',
    renderIcono: () => <IconoPinza />,
  },
  {
    nombre: 'ADIÓS',
    descripcion: 'Mano totalmente abierta oscilando horizontalmente rápido.',
    renderIcono: () => <HandIcon dedos={[1, 1, 1, 1, 1]} movimiento="lateral_rapido" />,
  },
  {
    nombre: '¿ESTÁS BIEN?',
    descripcion: 'Puño cerrado con pulgar hacia arriba (gesto de "bien"). Nota: comparte la misma postura que AYUDA.',
    renderIcono: () => <HandIcon dedos={[1, 0, 0, 0, 0]} />,
  },
  {
    nombre: 'AGUA',
    descripcion: "Letra 'W' (dedos índice, medio y anular levantados, resto cerrado).",
    renderIcono: () => <HandIcon dedos={[0, 1, 1, 1, 0]} />,
  },
  {
    nombre: 'NECESITO',
    descripcion: 'Dedo índice curvado en forma de gancho apuntando hacia abajo.',
    renderIcono: () => <IconoNecesito />,
  },
  {
    nombre: 'BAÑO',
    descripcion: 'Mano plana extendida verticalmente (dedos juntos, cerca del rostro).',
    renderIcono: () => <HandIcon dedos={[1, 1, 1, 1, 1]} />,
  },
  {
    nombre: 'MÉDICO',
    descripcion: 'Letra \'V\' (dedos índice y medio levantados en "V", resto cerrado).',
    renderIcono: () => <HandIcon dedos={[0, 1, 1, 0, 0]} />,
  },
  {
    nombre: 'COMIDA',
    descripcion: 'Yemas de los dedos juntas (forma de pico de pato, cerca de la boca).',
    renderIcono: () => <IconoPinza />,
  },
  {
    nombre: 'TE QUIERO',
    descripcion: 'Signo ILY (pulgar, índice y meñique levantados, medio y anular cerrados).',
    renderIcono: () => <HandIcon dedos={[1, 1, 0, 0, 1]} />,
  },
];

const Dictionary: React.FC = () => {
  return (
    <div className="dictionary-view">
      <div className="intro-diccionario">
        <h2>Aprendé a hacer cada seña</h2>
        <p>
          Posicioná tu mano frente a la cámara siguiendo estas indicaciones para que el traductor la reconozca correctamente en tiempo real.
        </p>
      </div>

      <section className="grid-senas">
        {SENAS_DICCIONARIO.map((sena, idx) => (
          <article
            key={sena.nombre}
            className="tarjeta-sena"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="icono-sena">{sena.renderIcono()}</div>
            <h3>{sena.nombre}</h3>
            <p>{sena.descripcion}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Dictionary;
