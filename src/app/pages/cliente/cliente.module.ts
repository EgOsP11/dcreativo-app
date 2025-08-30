import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientePageRoutingModule } from './cliente-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular'; // Importación básica

import { ClientePage } from './cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientePageRoutingModule,
    FullCalendarModule,
    
  ],
  declarations: [ClientePage]
})
export class ClientePageModule {}
