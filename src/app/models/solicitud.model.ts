export interface Solicitud {
id?: string;
fecha: string;
solicitadoPor: string;
estado: 'pendiente' | 'aprobada' | 'rechazada';
creadaEn: any;
}