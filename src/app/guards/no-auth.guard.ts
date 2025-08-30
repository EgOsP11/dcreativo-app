import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return new Promise(resolve => {
      this.firebaseSvc.getAuthInstance().authState.subscribe(auth => {
        if (!auth) {
          resolve(true);  // Puede entrar (no logueado)
        } else {
          this.utilsSvc.routerLink('/main/home'); // Redirige si YA está logueado
          resolve(false);
        }
      });
    });
  }
}
