import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Campo } from 'src/app/models/campo.model';
import { ModalController, AlertController } from '@ionic/angular';
import { CampoModalPage } from './campo-modal/campo-modal.page';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { User } from 'src/app/models/user.model';

@Component({
selector: 'app-calendario',
templateUrl: './calendario.page.html',
styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
calendarOptions: CalendarOptions = {
plugins: [dayGridPlugin, interactionPlugin],
initialView: 'dayGridMonth',
locale: esLocale,
headerToolbar: {
left: 'prev,next today',
center: 'title',
right: ''
},
events: [],
eventDisplay: 'block',
dayMaxEventRows: true,
height: 'auto',
};

campos: Campo[] = [];
uidToNombre: Record<string, string> = {};

constructor(
private firebaseSvc: FirebaseService,
private modalCtrl: ModalController,
private alertCtrl: AlertController
) {}

ngOnInit() {
this.loadCampos();
}

loadCampos() {
  this.firebaseSvc.getAllUsers().subscribe((users: User[]) => {
  this.uidToNombre = {};
  users.forEach(user => {
  this.uidToNombre[user.uid] = user.name;
  });

  this.firebaseSvc.getCampos().subscribe((campos: Campo[]) => {
    this.campos = campos.map(c => ({
      ...c,
      creadoEn: c.creadoEn instanceof Date ? c.creadoEn : c.creadoEn.toDate(),
      colaboradores: c.colaboradores?.map(uid => this.uidToNombre[uid] || uid) || []
    }));
    this.setupCalendar(this.campos);
  });
});
}

setupCalendar(campos: Campo[]) {
const todayStr = new Date().toISOString().split('T')[0];
const events = campos.map(campo => {
  const fechaCampo = campo.fecha;
  let color = '#ffc107'; // amarillo planeado por defecto

  if (fechaCampo === todayStr) {
    color = '#dc3545'; // rojo día actual
  } else if (fechaCampo < todayStr) {
    color = '#28a745'; // verde pasado
  }

  return {
    id: campo.id,
    title: campo.titulo.length > 15 ? campo.titulo.slice(0, 15) + '...' : campo.titulo,
    date: campo.fecha,
    backgroundColor: color,
    borderColor: color,
    extendedProps: { campo }
  };
});

this.calendarOptions = {
  ...this.calendarOptions,
  events: events,
  eventClick: this.handleEventClick.bind(this)
};
}
async handleEventClick(clickInfo: EventClickArg) {
  const campo: Campo = clickInfo.event.extendedProps['campo'];
  const colaboradoresTexto = campo.colaboradores?.join(', ') || 'Ninguno';

  const alert = await this.alertCtrl.create({
    header: campo.titulo,
    message:
    '📅 Fecha del campo: ' + campo.fecha + ' ' + campo.hora + '\n' + '\n' +
    '📍 Lugar: ' + campo.lugar + '\n' +
    '📌 Estado: ' + campo.estado + '\n' +
    '📝 Detalles: ' + (campo.detalles || 'Sin detalles') + '\n' +
    '👥 Colaboradores: ' + colaboradoresTexto,
    buttons: [
    {
    text: 'Editar',
    handler: () => this.abrirModalEditar(campo)
    },
    {
    text: 'Eliminar',
    role: 'destructive',
    handler: () => this.eliminarCampo(campo.id)
    },
    'Cerrar'
    ],
    cssClass: 'custom-alert'
    });

await alert.present();
}

async abrirModalEditar(campo: Campo) {
const modal = await this.modalCtrl.create({
component: CampoModalPage,
componentProps: { campo }
});

await modal.present();

const { data } = await modal.onDidDismiss();
if (data === true) {
  this.loadCampos();
}
}

async eliminarCampo(id: string) {
const confirm = await this.alertCtrl.create({
header: 'Confirmar',
message: '¿Seguro que quieres eliminar este campo?',
buttons: [
{ text: 'Cancelar', role: 'cancel' },
{
text: 'Eliminar',
role: 'destructive',
handler: async () => {
await this.firebaseSvc.deleteCampo(id);
this.loadCampos();
}
}
]
});

await confirm.present();
}

async abrirModalCampo() {
const modal = await this.modalCtrl.create({
component: CampoModalPage
});
await modal.present();
const { data } = await modal.onDidDismiss();
if (data === true) {
  this.loadCampos();
}
}
}



