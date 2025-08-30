import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertCtrl = inject(AlertController);

  clientes: User[] = [];
  myUid = '';

  ngOnInit() {
    this.loadClientes();
  }

  async loadClientes() {
    const current = await this.utilsSvc.getFromLocalStorage('user');
    this.myUid = current?.uid;

    this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
      const otros = users.filter(u => u.uid !== this.myUid);
      this.clientes = otros.filter(u => u.role === 'cliente');
    });
  }

  async eliminarCliente(user: User) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar cliente?',
      message: `¿Deseas eliminar permanentemente a ${user.name}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              // Elimina el documento del usuario desde Firestore
              await this.firebaseSvc.deleteDocument(`users/${user.uid}`);

              // Opcional: si también deseas eliminarlo de Firebase Auth (requiere función en backend o permisos de Admin SDK)
              // await this.firebaseSvc.eliminarUsuarioDeAuth(user.uid);

              // Recargar lista desde Firebase (seguro)
              this.loadClientes();

              // Mostrar toast por 3 segundos
              this.utilsSvc.presentToast({
                message: 'Cliente eliminado',
                color: 'danger',
                duration: 3000
              });
            } catch (error) {
              this.utilsSvc.presentToast({
                message: 'Error al eliminar cliente',
                color: 'danger',
                duration: 3000
              });
              console.error('❌ Error eliminando cliente:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
