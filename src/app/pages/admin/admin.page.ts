import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  myUid = '';

  // 🔑 Listas organizadas por rol
  usuariosEnEspera: User[] = [];
  clientes: User[] = [];
  trabajadores: User[] = [];

  // Control de pestaña activa (si usas segment)
  seccionSeleccionada = 'espera';

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    const current = await this.utilsSvc.getFromLocalStorage('user');
    this.myUid = current?.uid;

    this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
      const otros = users.filter(u => u.uid !== this.myUid);
    
      this.usuariosEnEspera = otros.filter(u => !u.role);
      this.clientes = otros.filter(u => u.role === 'cliente');
      this.trabajadores = otros.filter(u => u.role === 'trabajador');
    });
  }

  async asignarRol(uid: string, nuevoRol: string) {
    const path = `users/${uid}`;
    await this.firebaseSvc.updateDocument(path, { role: nuevoRol });
    this.utilsSvc.presentToast({
      message: `Rol asignado: ${nuevoRol}`,
      color: 'success',
      duration: 1500
    });
  }

  signOut() {
    this.firebaseSvc.signOut();
  }
}
