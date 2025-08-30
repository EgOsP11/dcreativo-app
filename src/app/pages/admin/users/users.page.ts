import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  usuariosEnEspera: User[] = [];
  myUid = '';

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    const current = await this.utilsSvc.getFromLocalStorage('user');
    this.myUid = current?.uid;

    this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
      const otros = users.filter(u => u.uid !== this.myUid);
      this.usuariosEnEspera = otros.filter(u => !u.role || u.role.trim() === '');
    });
  }

  async asignarRol(uid: string, nuevoRol: string) {
    const path = `users/${uid}`;
    await this.firebaseSvc.setDocument(path, { role: nuevoRol });
    this.utilsSvc.presentToast({
      message: `Rol asignado: ${nuevoRol}`,
      color: 'success',
      duration: 1500
    });
  }

}
