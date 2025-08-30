export interface Campo {
    id?: string;
    titulo: string;
    fecha: string;
    hora: string;
    estado: string;
    lugar: string;
    detalles: string;
    colaboradores: string[];
    clienteId: string; // 🟢 Este es clave para saber de quién es
    creadoPor: string;
    creadoEn: any;
  }