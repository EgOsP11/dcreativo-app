import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

  //=====Loading (círculo de carga al iniciar sesión)=======
  loading() {
    return this.loadingCtrl.create({ spinner: 'crescent' });
  }

  //======Toast (notificaciones flotantes)======
  async presentToast(options: { 
    message: string; 
    color?: string; 
    duration?: number; 
    position?: 'top' | 'bottom' | 'middle'; 
    icon?: string 
  }) {
    const toast = await this.toastCtrl.create({
      message: options.message,
      color: options.color || 'dark',
      duration: options.duration || 2000,
      position: options.position || 'bottom',
      icon: options.icon || undefined,
    });
    await toast.present();
  }

  //======Navegar a cualquier página=======
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  //=====Guardar en localStorage=======
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  //======Obtener desde localStorage=======
  getFromLocalStorage(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
}
