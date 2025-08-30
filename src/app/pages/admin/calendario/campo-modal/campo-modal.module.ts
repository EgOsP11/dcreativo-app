import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CampoModalPageRoutingModule } from './campo-modal-routing.module';

import { CampoModalPage } from './campo-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CampoModalPageRoutingModule
  ],
  declarations: [CampoModalPage]
})
export class CampoModalPageModule {}
