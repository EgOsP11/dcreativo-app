import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertCtrl = inject(AlertController);

  trabajadores: User[] = [];
  myUid = '';

  ngOnInit() {
    this.loadTrabajadores();
  }

  async loadTrabajadores() {
    const current = await this.utilsSvc.getFromLocalStorage('user');
    this.myUid = current?.uid;

    this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
      const otros = users.filter(u => u.uid !== this.myUid);
      this.trabajadores = otros.filter(u => u.role === 'trabajador');
    });
  }

  async eliminarTrabajador(user: User) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar trabajador?',
      message: `¿Deseas eliminar permanentemente a ${user.name}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.firebaseSvc.deleteDocument(`users/${user.uid}`);
            this.trabajadores = this.trabajadores.filter(t => t.uid !== user.uid);
            this.utilsSvc.presentToast({ message: 'Colaborador eliminado', color: 'danger', duration: 3000 });
          }
        }
      ]
    });

    await alert.present();
  }
}
