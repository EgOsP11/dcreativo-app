import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Tarea } from 'src/app/models/tarea.model';
import { User } from 'src/app/models/user.model';
import { AlertController, ModalController } from '@ionic/angular';
import { TareaModalPage } from './tarea-modal/tarea-modal.page';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
})
export class TareasPage implements OnInit {
  tareas: Tarea[] = [];
  uidToNombre: Record<string, string> = {};

  constructor(
    private firebaseSvc: FirebaseService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadTareas();
  }

  loadTareas() {
    this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
      this.uidToNombre = {};
      users.forEach(u => (this.uidToNombre[u.uid] = u.name));

      this.firebaseSvc.getTareas().subscribe((tareas: Tarea[]) => {
        this.tareas = tareas;
      });
    });
  }

  getColorPorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'entregado': return 'tertiary';
      case 'aprobado': return 'success';
      case 'rechazado': return 'danger';
      case 'por_corregir': return 'medium';
      default: return 'light';
    }
  }

  async abrirModalTarea() {
    const modal = await this.modalCtrl.create({ component: TareaModalPage });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data === true) this.loadTareas();
  }

  async cambiarEstado(tarea: Tarea) {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar estado',
      inputs: [
        { label: 'Pendiente', type: 'radio', value: 'pendiente', checked: tarea.estado === 'pendiente' },
        { label: 'Entregado', type: 'radio', value: 'entregado', checked: tarea.estado === 'entregado' },
        { label: 'Aprobado', type: 'radio', value: 'aprobado', checked: tarea.estado === 'aprobado' },
        { label: 'Rechazado', type: 'radio', value: 'rechazado', checked: tarea.estado === 'rechazado' },
        { label: 'Por corregir', type: 'radio', value: 'por_corregir', checked: tarea.estado === 'por_corregir' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (nuevoEstado: string) => {
            await this.firebaseSvc.updateTarea(tarea.id!, { estado: nuevoEstado });
          },
        },
      ],
    });
    await alert.present();
  }

  async eliminarTarea(id: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar tarea?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.firebaseSvc.deleteDocument(`tareas/${id}`);
            this.tareas = this.tareas.filter(t => t.id !== id);
          },
        },
      ],
    });
    await alert.present();
  }
}
