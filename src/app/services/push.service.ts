import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class PushService {
  private _fcmToken: string | null = null;

  constructor(
    private fb: FirebaseService,
    private router: Router,
  ) {}

  /** Llama esto al arrancar la app (y también tras login si quieres) */
  async init(): Promise<void> {
    // 1) Permisos (Android 13+)
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') {
        console.warn('[Push] Permiso NO concedido');
        return;
      }
    }

    // 2) Registrar el dispositivo en FCM
    await PushNotifications.register();

    // 3) Listeners
    PushNotifications.addListener('registration', async (t: Token) => {
      this._fcmToken = t.value;
      console.log('[Push] FCM TOKEN:', t.value);

      // Guarda el token ligado al usuario, si hay sesión
      try {
        const user = await this.fb.getCurrentUser();
        if (user?.uid) {
          await this.fb.setDocument(`users/${user.uid}`, { notificationToken: t.value });
          console.log('[Push] Token guardado en users/', user.uid);
        } else {
          console.warn('[Push] No hay usuario logueado; token pendiente de guardar');
        }
      } catch (e) {
        console.error('[Push] Error guardando token en Firestore:', e);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Error registrando:', err);
    });

    // Notificación recibida con app en primer plano
    PushNotifications.addListener('pushNotificationReceived', (n: PushNotificationSchema) => {
      console.log('[Push] Recibida (foreground):', n);
      // Puedes cambiar por un toast propio
      alert(`${n.title ?? 'Notificación'}\n${n.body ?? ''}`);
    });

    // Usuario tocó la notificación (abre app desde background)
    PushNotifications.addListener('pushNotificationActionPerformed', (a: ActionPerformed) => {
      const data = a.notification?.data || {};
      console.log('[Push] Acción en notificación:', data);

      // Navegación basada en el payload "data" que envías desde el backend/script
      if (data.screen === 'tareas' && data.taskId) {
        this.router.navigate(['/tareas', data.taskId]);
      } else if (data.screen) {
        this.router.navigate(['/', data.screen]);
      }
    });
  }

  /** Obtén el token cuando lo necesites (puede ser null si aún no registra) */
  getToken(): string | null {
    return this._fcmToken;
  }
}
