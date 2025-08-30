import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return new Promise(resolve => {
      this.firebaseSvc.getAuthInstance().onAuthStateChanged(user => {
        if (user) {
          resolve(true); // Puede entrar
        } else {
          resolve(this.router.createUrlTree(['/auth'])); // Redirige si no está logueado
        }
      });
    });
  }
}
