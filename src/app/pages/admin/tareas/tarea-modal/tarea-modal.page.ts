import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Tarea } from 'src/app/models/tarea.model';
import { User } from 'src/app/models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-tarea-modal',
  templateUrl: './tarea-modal.page.html',
  styleUrls: ['./tarea-modal.page.scss'],
})
export class TareaModalPage implements OnInit {
  trabajadores: User[] = [];

  tarea: Partial<Tarea> = {
    titulo: '',
    asignadoA: '',
    fechaLimite: '',
    estado: 'pendiente',
    creadoPor: '',
    creadoEn: new Date(),
  };

  constructor(
    private modalCtrl: ModalController,
    private firebaseSvc: FirebaseService
  ) {}

  ngOnInit() {
    this.firebaseSvc.getAllUsers().subscribe((usuarios: User[]) => {
      this.trabajadores = usuarios.filter(u => u['role'] === 'trabajador');
    });
  }

  async guardar() {
    if (!this.tarea.titulo || !this.tarea.asignadoA || !this.tarea.fechaLimite) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }
  
    const id = uuidv4();
    const user = await this.firebaseSvc.getCurrentUser();
  
    const nuevaTarea: Tarea = {
      id,
      titulo: this.tarea.titulo!,
      asignadoA: this.tarea.asignadoA!, // UID del trabajador
      fechaLimite: this.tarea.fechaLimite!,
      estado: 'pendiente',
      creadoPor: user?.uid || '',
      creadoEn: new Date()
    };
  
    // Guardar tarea en Firestore
    await this.firebaseSvc.setDocument(`tareas/${id}`, nuevaTarea);
  
    // Obtener token del trabajador asignado
    const trabajadorData = await this.firebaseSvc.getDocument(`users/${this.tarea.asignadoA}`);
    const token = trabajadorData?.['notificationToken'];
  
    if (token) {
      // Mandar notificación al colaborador
      await this.firebaseSvc.sendPushNotification(
        token,
        'Nueva tarea asignada',
        `Se te ha asignado la tarea: ${this.tarea.titulo}`
      );
      console.log(`Notificación enviada al trabajador ${this.tarea.asignadoA}`);
    } else {
      console.warn('No se encontró token de notificación para el trabajador');
    }
  
    this.modalCtrl.dismiss(true);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
