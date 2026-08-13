export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// Calcula la distancia euclidiana 3D entre dos landmarks
export const calculateDistance = (p1: Landmark, p2: Landmark): number => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

// Determina si un dedo (Índice, Medio, Anular, Meñique) está extendido
// M = MCP (nudillo), P = PIP (articulación media), T = TIP (punta)
export const isFingerExtended = (mcp: Landmark, pip: Landmark, tip: Landmark): boolean => {
  // En una posición extendida, la distancia nudillo-punta es significativamente mayor 
  // que la distancia nudillo-articulación media.
  return calculateDistance(mcp, tip) > calculateDistance(mcp, pip) * 1.15;
};

// Determina si el pulgar está extendido
export const isThumbExtended = (
  mcp: Landmark,
  ip: Landmark,
  tip: Landmark,
  indexMcp: Landmark
): boolean => {
  // El pulgar está extendido si la punta está lejos del MCP y también lejos del nudillo del índice
  const isExtendedFromBase = calculateDistance(mcp, tip) > calculateDistance(mcp, ip) * 1.1;
  const isPushedOut = calculateDistance(tip, indexMcp) > calculateDistance(ip, indexMcp) * 1.05;
  return isExtendedFromBase && isPushedOut;
};

// Clasifica la postura de la mano basándose en la configuración de los dedos
export const classifyHandPostur = (landmarks: Landmark[]): string | null => {
  if (!landmarks || landmarks.length < 21) return null;

  // Dedos extendidos estándar
  const isIndex = isFingerExtended(landmarks[5], landmarks[6], landmarks[8]);
  const isMiddle = isFingerExtended(landmarks[9], landmarks[10], landmarks[12]);
  const isRing = isFingerExtended(landmarks[13], landmarks[14], landmarks[16]);
  const isPinky = isFingerExtended(landmarks[17], landmarks[18], landmarks[20]);
  const isThumb = isThumbExtended(landmarks[2], landmarks[3], landmarks[4], landmarks[5]);

  // 1. PINZA (COMIDA o PERDÓN): las puntas de los 5 dedos están muy cerca entre sí (capullo/pico de pato)
  const thumbTip = landmarks[4];
  const distanceIndex = calculateDistance(thumbTip, landmarks[8]);
  const distanceMiddle = calculateDistance(thumbTip, landmarks[12]);
  const distanceRing = calculateDistance(thumbTip, landmarks[16]);
  const distancePinky = calculateDistance(thumbTip, landmarks[20]);
  const pinzaThreshold = 0.085; // Umbral empírico ajustado

  if (
    distanceIndex < pinzaThreshold &&
    distanceMiddle < pinzaThreshold &&
    distanceRing < pinzaThreshold &&
    distancePinky < pinzaThreshold
  ) {
    return 'PINZA';
  }

  // 2. GANCHO_NECESITO: el índice está a medio doblar (gancho) y los otros cerrados
  // Detectamos esto si el índice no está totalmente extendido, pero la punta está más arriba 
  // que el nudillo, y los demás están cerrados.
  const isIndexHook = 
    !isIndex && 
    landmarks[8].y < landmarks[5].y && // punta más alta que el nudillo en Y (canvas Y disminuye hacia arriba)
    calculateDistance(landmarks[5], landmarks[8]) > calculateDistance(landmarks[5], landmarks[6]) * 0.75;

  if (isIndexHook && !isMiddle && !isRing && !isPinky) {
    return 'GANCHO_NECESITO';
  }

  // 3. Posturas por extensión directa de dedos
  
  // MANO_ABIERTA: todos extendidos (pulgar opcionalmente extendido o semi-extendido)
  if (isIndex && isMiddle && isRing && isPinky) {
    return 'MANO_ABIERTA';
  }

  // ILY_TEQUIERO: pulgar, índice y meñique extendidos; medio y anular cerrados
  if (isThumb && isIndex && !isMiddle && !isRing && isPinky) {
    return 'ILY_TEQUIERO';
  }

  // V_MEDICO: índice y medio extendidos; los demás cerrados
  if (!isThumb && isIndex && isMiddle && !isRing && !isPinky) {
    return 'V_MEDICO';
  }

  // W_AGUA: índice, medio y anular extendidos; pulgar y meñique cerrados
  if (!isThumb && isIndex && isMiddle && isRing && !isPinky) {
    return 'W_AGUA';
  }

  // PULGAR_ARRIBA (AYUDA): solo pulgar extendido
  if (isThumb && !isIndex && !isMiddle && !isRing && !isPinky) {
    return 'PULGAR_ARRIBA';
  }

  // MENIQUE_ARRIBA (SI): solo meñique extendido
  if (!isThumb && !isIndex && !isMiddle && !isRing && isPinky) {
    return 'MENIQUE_ARRIBA';
  }

  // INDICE: solo el índice extendido (resto cerrado)
  if (!isThumb && isIndex && !isMiddle && !isRing && !isPinky) {
    return 'INDICE';
  }

  return null;
};
