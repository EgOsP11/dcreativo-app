export interface Tarea {
  id?: string;
  titulo: string;
  asignadoA: string;   // UID del trabajador
  fechaLimite: string;
  estado: 'pendiente' | 'entregado' | 'aprobado' | 'rechazado' | 'por_corregir';
  evidenciaUrl?: string;
  creadoPor?: string;  // UID del admin que la creó
  creadoEn?: Date;     // Fecha de creación
}