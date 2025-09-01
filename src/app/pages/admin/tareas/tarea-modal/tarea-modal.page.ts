import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Tarea } from 'src/app/models/tarea.model';
import { User } from 'src/app/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tarea-modal',
  templateUrl: './tarea-modal.page.html',
  styleUrls: ['./tarea-modal.page.scss'],
})
export class TareaModalPage implements OnInit, OnDestroy {
  trabajadores: User[] = [];
  private subs: Subscription = new Subscription();

  tarea: Partial<Tarea> = {
    titulo: '',
    asignadoA: '',
    fechaLimite: '',
    estado: 'pendiente',
    creadoPor: '',
    creadoEn: new Date(),
  };

  guardando = false;

  constructor(
    private modalCtrl: ModalController,
    private firebaseSvc: FirebaseService
  ) {}

  ngOnInit() {
    const sub = this.firebaseSvc.getAllUsers().subscribe((usuarios: User[]) => {
      this.trabajadores = usuarios.filter(u => u['role'] === 'trabajador');
    });
    this.subs.add(sub);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  async guardar() {
    if (!this.tarea.titulo || !this.tarea.asignadoA || !this.tarea.fechaLimite) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }

    this.guardando = true;
    const id = uuidv4();

    try {
      const user = await this.firebaseSvc.getCurrentUser();

      const nuevaTarea: Tarea = {
        id,
        titulo: this.tarea.titulo!,
        asignadoA: this.tarea.asignadoA!, // UID del trabajador
        fechaLimite: this.tarea.fechaLimite!,
        estado: 'pendiente',
        creadoPor: user?.uid || '',
        creadoEn: new Date(),
      };

      // 1) Guardar tarea en Firestore
      await this.firebaseSvc.setDocument(`tareas/${id}`, nuevaTarea);

      // 2) Intentar notificar
      try {
        // Si tienes notifyUser(uid, title, body, data)
        if (typeof (this.firebaseSvc as any).notifyUser === 'function') {
          await (this.firebaseSvc as any).notifyUser(
            nuevaTarea.asignadoA,
            'Nueva tarea asignada',
            `Se te ha asignado la tarea: ${nuevaTarea.titulo}`,
            { taskId: id, screen: 'tareas' }
          );
          console.log(`[Push] Notificación enviada vía notifyUser a UID ${nuevaTarea.asignadoA}`);
        } else {
          // Si solo tienes sendPushNotification(token,...)
          const trabajadorData = await this.firebaseSvc.getDocument(`users/${nuevaTarea.asignadoA}`);
          const token = trabajadorData?.['notificationToken'];

          if (token) {
            await this.firebaseSvc.sendPushNotification(
              token,
              'Nueva tarea asignada',
              `Se te ha asignado la tarea: ${nuevaTarea.titulo}`,
              { taskId: id, screen: 'tareas' }
            );
            console.log(`[Push] Notificación enviada al token de UID ${nuevaTarea.asignadoA}`);
          } else {
            console.warn('[Push] El trabajador no tiene notificationToken');
          }
        }
      } catch (e) {
        console.error('[Push] Error al enviar notificación', e);
      }

      // 3) Cerrar modal con éxito
      this.modalCtrl.dismiss(true);

    } catch (e) {
      console.error('Error creando tarea', e);
      alert('Hubo un error al crear la tarea.');
    } finally {
      this.guardando = false;
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
