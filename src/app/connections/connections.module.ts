import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConnectionsPageRoutingModule } from './connections-routing.module';

import { ConnectionsPage } from './connections.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConnectionsPageRoutingModule,
    TranslateModule
  ],
  declarations: [ConnectionsPage]
})
export class ConnectionsPageModule {}
