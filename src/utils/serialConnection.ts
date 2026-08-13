// Helper para manejar la conexión Web Serial con el ESP32 desde el navegador
export class SerialConnection {
  private port: any | null = null;
  private writer: any | null = null;

  // Verifica si el navegador soporta la Web Serial API
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  // Verifica si hay una conexión activa
  public isConnected(): boolean {
    return this.port !== null && this.port.readable !== null;
  }

  // Solicita al usuario elegir un puerto y abre la conexión
  public async connect(baudRate: number = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Web Serial no está soportado en este navegador.');
      return false;
    }

    try {
      // Solicita permiso al usuario para conectarse a un dispositivo serial
      const serialObj = (navigator as any).serial;
      this.port = await serialObj.requestPort();
      
      // Abre el puerto con la velocidad especificada
      await this.port.open({ baudRate });
      
      console.log('Conectado con éxito al dispositivo serial');
      return true;
    } catch (error) {
      console.error('Error al conectar con el puerto serial:', error);
      this.port = null;
      return false;
    }
  }

  // Cierra la conexión activa
  public async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer.releaseLock();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      console.log('Dispositivo serial desconectado');
    } catch (error) {
      console.error('Error al desconectar del puerto serial:', error);
    }
  }

  // Envía un texto (seña) al dispositivo serial
  public async write(text: string): Promise<boolean> {
    if (!this.isConnected() || !this.port.writable) {
      return false;
    }

    try {
      // Si no tenemos un writer activo, lo creamos
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      this.writer = this.port.writable.getWriter();
      await this.writer.write(data);
      
      // Liberamos el lock del writer inmediatamente después de escribir
      this.writer.releaseLock();
      this.writer = null;
      
      return true;
    } catch (error) {
      console.error('Error al escribir en el puerto serial:', error);
      
      // Si falla, intentamos resetear el estado del writer
      if (this.writer) {
        try {
          this.writer.releaseLock();
        } catch (_) {}
        this.writer = null;
      }
      return false;
    }
  }
}

// Exportamos una única instancia singleton
export const serialConnection = new SerialConnection();
