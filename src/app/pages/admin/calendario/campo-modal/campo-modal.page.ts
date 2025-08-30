import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Campo } from 'src/app/models/campo.model';
import { User } from 'src/app/models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
selector: 'app-campo-modal',
templateUrl: './campo-modal.page.html',
styleUrls: ['./campo-modal.page.scss'],
})
export class CampoModalPage implements OnInit {
@Input() campo?: Campo; // Si viene para editar
trabajadores: User[] = [];
campoData: Partial<Campo> = {
titulo: '',
fecha: '',
hora: '',
estado: 'planeado',
lugar: '',
detalles: '',
colaboradores: [],
creadoPor: '',
creadoEn: new Date()
};

constructor(
private modalCtrl: ModalController,
private firebaseSvc: FirebaseService
) {}

async ngOnInit() {
// Cargar trabajadores
this.firebaseSvc.getAllUsers().subscribe((usuarios: User[]) => {
this.trabajadores = usuarios.filter(u => u.role === 'trabajador');
});
// Si es edición, clonar el campo recibido
if (this.campo) {
  this.campoData = {
    ...this.campo,
    colaboradores: [...(this.campo.colaboradores || [])]
  };
}
}

toggleColaborador(uid: string, checked: boolean) {
if (checked) {
if (!this.campoData.colaboradores?.includes(uid)) {
this.campoData.colaboradores?.push(uid);
}
} else {
this.campoData.colaboradores = this.campoData.colaboradores?.filter(id => id !== uid);
}
}

async guardar() {
const user = await this.firebaseSvc.getCurrentUser();
this.campoData.colaboradores = [...new Set(this.campoData.colaboradores || [])]; // Eliminar duplicados
if (this.campo?.id) {
  // Modo edición
  await this.firebaseSvc.updateDocument(`campos/${this.campo.id}`, this.campoData);
} else {
  // Nuevo campo
  const id = uuidv4();
  this.campoData.creadoPor = user?.uid || '';
  this.campoData.creadoEn = new Date();
  await this.firebaseSvc.setDocument(`campos/${id}`, this.campoData);
}

this.modalCtrl.dismiss(true);

}

cerrar() {
this.modalCtrl.dismiss();
}
}