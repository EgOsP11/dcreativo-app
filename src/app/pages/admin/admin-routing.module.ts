import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
      { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule) },
      { path: 'clientes', loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesPageModule) },
      { path: 'trabajadores', loadChildren: () => import('./trabajadores/trabajadores.module').then(m => m.TrabajadoresPageModule) },
      { path: 'calendario', loadChildren: () => import('./calendario/calendario.module').then(m => m.CalendarioPageModule) },
      { path: 'tareas', loadChildren: () => import('./tareas/tareas.module').then(m => m.TareasPageModule) },
      { path: 'solicitudes', loadChildren: () => import('./solicitudes/solicitudes.module').then(m => m.SolicitudesPageModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
