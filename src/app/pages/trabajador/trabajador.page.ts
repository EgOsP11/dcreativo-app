import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Tarea } from 'src/app/models/tarea.model';
import { Campo } from 'src/app/models/campo.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-trabajador',
  templateUrl: './trabajador.page.html',
  styleUrls: ['./trabajador.page.scss'],
})
export class TrabajadorPage implements OnInit {
  currentUser: User;
  tareas: Tarea[] = [];
  campos: Campo[] = [];

  constructor(public firebaseSvc: FirebaseService) {}

  async ngOnInit() {
    const user = await this.firebaseSvc.getCurrentUser();
    if (user) {
      this.currentUser = {
        uid: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? ''
      };
      this.loadData();
    }
  }

  loadData() {
    this.firebaseSvc.getTareasAsignadas(this.currentUser.uid).subscribe(t => this.tareas = t);
    this.firebaseSvc.getCamposAsignados(this.currentUser.uid).subscribe(c => this.campos = c);
  }

  async subirEvidencia(tarea: Tarea, event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const path = `evidencias/${tarea.id}-${Date.now()}`;
      const url = await this.firebaseSvc.uploadFile(path, file);
      await this.firebaseSvc.updateTarea(tarea.id!, { evidenciaUrl: url });
    }
  }

  async marcarComoCompletada(tarea: Tarea) {
    // Marca como entregada (sin aprobar aún, pendiente de admin)
    await this.firebaseSvc.updateTarea(tarea.id!, { estado: 'entregado' });
  }

  cerrarSesion() {
    this.firebaseSvc.signOut();
  }
}
