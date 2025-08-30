import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TareaModalPage } from './tarea-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TareaModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TareaModalPageRoutingModule {}
