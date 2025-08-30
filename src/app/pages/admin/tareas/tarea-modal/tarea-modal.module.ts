import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TareaModalPageRoutingModule } from './tarea-modal-routing.module';

import { TareaModalPage } from './tarea-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TareaModalPageRoutingModule
  ],
  declarations: [TareaModalPage]
})
export class TareaModalPageModule {}
