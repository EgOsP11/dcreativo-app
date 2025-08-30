import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Campo } from 'src/app/models/campo.model';
import { Solicitud } from 'src/app/models/solicitud.model';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
})
export class ClientePage implements OnInit {
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
    dateClick: this.handleDateClick.bind(this)
  };

  uidCliente = '';
  campos: Campo[] = [];
  misCampos: Campo[] = [];
  misSolicitudes: Solicitud[] = [];

  constructor(
    public firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const user = await this.utilsSvc.getFromLocalStorage('user');
    this.uidCliente = user?.uid;
    this.cargarCampos();
    this.cargarMisSolicitudes();
  }

  cargarCampos() {
    this.firebaseSvc.getCampos().subscribe((campos: Campo[]) => {
      this.campos = campos;

      // ✅ Solo mostrar campos asignados a este cliente
      this.misCampos = campos.filter(c => c.clienteId === this.uidCliente);

      const eventos = campos.map((campo) => {
        const esMio = campo.clienteId === this.uidCliente;
        return {
          title: esMio ? 'Mi sesión' : 'Día ocupado',
          date: campo.fecha,
          display: 'block',
          backgroundColor: esMio ? '#28a745' : '#ffdddd',
          borderColor: esMio ? '#28a745' : '#ff4d4d',
          textColor: 'black'
        };
      });

      this.calendarOptions = {
        ...this.calendarOptions,
        events: eventos
      };
    });
  }

  cargarMisSolicitudes() {
    this.firebaseSvc.getSolicitudes().subscribe((todas: Solicitud[]) => {
      this.misSolicitudes = todas.filter(s =>
        s.solicitadoPor === this.uidCliente &&
        (s.estado === 'pendiente' || s.estado === 'rechazada')
      );
    });
  }

  async cancelarSolicitud(solicitud: Solicitud) {
    const confirmado = confirm('¿Estás seguro de cancelar esta solicitud?');
    if (!confirmado) return;

    await this.firebaseSvc.updateSolicitud(solicitud.id!, { estado: 'cancelada' });
    this.utilsSvc.presentToast({ message: 'Solicitud cancelada', color: 'medium' });
    this.misSolicitudes = this.misSolicitudes.filter(s => s.id !== solicitud.id);
  }

  async handleDateClick(arg: { dateStr: string }) {
    const fechaClick = arg.dateStr;
    const ocupado = this.campos.some(c => c.fecha === fechaClick);
    const esMio = this.campos.some(c => c.fecha === fechaClick && c.clienteId === this.uidCliente);

    if (ocupado) {
      const alert = await this.alertCtrl.create({
        header: esMio ? 'Tienes una sesión' : 'Fecha no disponible',
        message: esMio
          ? 'Tienes una sesión agendada para este día.'
          : 'Ya hay una sesión agendada para este día. Por favor, selecciona otro.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Fecha disponible',
        message: '¿Quieres solicitar esta fecha para una sesión?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Solicitar',
            handler: async () => {
              const solicitud: Solicitud = {
                id: `${this.uidCliente}_${fechaClick}`,
                fecha: fechaClick,
                solicitadoPor: this.uidCliente,
                estado: 'pendiente',
                creadaEn: new Date()
              };
              await this.firebaseSvc.setDocument(`solicitudes/${solicitud.id}`, solicitud);
              const ok = await this.alertCtrl.create({
                header: 'Solicitud enviada',
                message: 'Tu solicitud ha sido registrada.',
                buttons: ['OK']
              });
              await ok.present();
              this.cargarMisSolicitudes();
            }
          }
        ]
      });
      await alert.present();
    }
  }
}
