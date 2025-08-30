import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Solicitud } from 'src/app/models/solicitud.model';
import { User } from 'src/app/models/user.model';
import { Campo } from 'src/app/models/campo.model';
import { v4 as uuidv4 } from 'uuid';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {

  solicitudes: Solicitud[] = [];
  uidToNombre: Record<string, string> = {};

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.firebaseSvc.getAllUsers().subscribe((usuarios: User[]) => {
      this.uidToNombre = {};
      usuarios.forEach(u => this.uidToNombre[u.uid] = u.name);
      this.firebaseSvc.getSolicitudes().subscribe((solicitudes: Solicitud[]) => {
        // Solo mostrar solicitudes pendientes o aprobadas sin campo creado
        this.solicitudes = solicitudes.filter(s => s.estado === 'pendiente' || s.estado === 'aprobada');
      });
    });
  }

  getNombreCliente(uid: string): string {
    return this.uidToNombre[uid] || 'Desconocido';
  }

  async cambiarEstado(solicitud: Solicitud, nuevoEstado: 'aprobada' | 'rechazada') {
    await this.firebaseSvc.updateSolicitud(solicitud.id!, { estado: nuevoEstado });

    // Eliminar de la vista local
    this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);

    if (nuevoEstado === 'rechazada') {
      this.utilsSvc.presentToast({
        message: 'Solicitud rechazada',
        color: 'warning',
        duration: 3000
      });
    }
  }

  async crearCampoDesdeSolicitud(solicitud: Solicitud) {
    const user = await this.utilsSvc.getFromLocalStorage('user');

    if (!solicitud.fecha || !solicitud.solicitadoPor || !user?.uid) {
      this.utilsSvc.presentToast({
        message: 'Faltan datos para crear el campo',
        color: 'danger'
      });
      return;
    }

    const campo: Campo = {
      id: uuidv4(),
      titulo: 'Sesión para cliente',
      fecha: solicitud.fecha,
      hora: '10:00',
      estado: 'planeado',
      lugar: 'Por definir',
      detalles: 'Agendado desde solicitud',
      colaboradores: [],
      clienteId: solicitud.solicitadoPor,
      creadoPor: user.uid,
      creadoEn: new Date()
    };

    await this.firebaseSvc.setDocument(`campos/${campo.id}`, campo);
    await this.firebaseSvc.updateSolicitud(solicitud.id!, { estado: 'aprobada' });

    this.utilsSvc.presentToast({
      message: 'Campo creado exitosamente desde solicitud',
      color: 'success',
      duration: 3000
    });

    // Eliminar solicitud de la lista ya que se convirtió en campo
    this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
  }

  async eliminarSolicitud(solicitud: Solicitud) {
    const confirmado = confirm(`¿Eliminar la solicitud para el ${solicitud.fecha}?`);
    if (!confirmado) return;
  
    await this.firebaseSvc.deleteDocument(`solicitudes/${solicitud.id}`);
    this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
  
    this.utilsSvc.presentToast({
      message: 'Solicitud eliminada',
      color: 'danger',
      duration: 2500
    });
  }
  
}
