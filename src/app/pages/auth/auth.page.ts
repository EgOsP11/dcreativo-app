import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  firebaseSvc = inject(FirebaseService);  
  utilsSvc    = inject(UtilsService);

  ngOnInit() {}

  async submit(){
    if(this.form.valid){
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signIn(this.form.value as User).then(
        res=>{
          this.getUserInfo(res.user.uid);
        }
      ).catch(error=>{
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
      }).finally(()=>{
        loading.dismiss();
      })
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
  
      const path = `users/${uid}`;

      this.firebaseSvc.getDocument(path).then((userDoc: any) => {
        console.log('🧾 Usuario cargado (raw):', userDoc);

        // Guardar tal cual
        this.utilsSvc.saveInLocalStorage('user', userDoc);

        // Role robusto (role/rol, trim + lower)
        const role = (
          userDoc?.role ?? userDoc?.rol ?? ''
        ).toString().trim().toLowerCase();

        // Nombre robusto (evita undefined)
        const displayName =
          (userDoc?.name && String(userDoc.name).trim()) ||
          (userDoc?.displayName && String(userDoc.displayName).trim()) ||
          (userDoc?.email && String(userDoc.email).split('@')[0]) ||
          'Usuario';

        // 🔀 Ruteo por rol (ruta correcta para trabajador)
        if (!role) {
          this.utilsSvc.routerLink('/main/home'); // sala de espera
        } else if (role === 'admin') {
          this.utilsSvc.routerLink('/admin');
        } else if (role === 'cliente') {
          this.utilsSvc.routerLink('/cliente');
        } else if (role === 'trabajador') {
          this.utilsSvc.routerLink('/trabajador'); // ✅ esta es la buena en tu app
        } else {
          this.utilsSvc.routerLink('/main/home'); // fallback
        }

        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${displayName}`,
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });

      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }).finally(() => {
        loading.dismiss();
      });
    }
  }
}
