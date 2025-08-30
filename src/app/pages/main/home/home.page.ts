import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
selector: 'app-home',
templateUrl: './home.page.html',
styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
firebaseSvc = inject(FirebaseService);
utilsSvc = inject(UtilsService);

showContent = false;
user: User | null = null;

async ngOnInit() {
const storedUser = await this.utilsSvc.getFromLocalStorage('user');
this.user = storedUser;

if (this.user && this.user.role) {
  const role = this.user.role.trim();

  if (role === 'admin') {
    this.utilsSvc.routerLink('/admin');
    return;
  } else if (role === 'cliente') {
    this.utilsSvc.routerLink('/cliente');
    return;
  } else if (role === 'trabajador') {
    this.utilsSvc.routerLink('/trabajador');
    return;
  }
}

// Si no tiene rol o es desconocido, mostrar la sala de espera
this.showContent = true;
//====cerrar sesion===
}
signOut(){
  this.firebaseSvc.signOut();
}

}
