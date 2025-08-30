import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampoModalPage } from './campo-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CampoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampoModalPageRoutingModule {}
