import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EndPageRoutingModule } from './end-routing.module';

import { EndPage } from './end.page';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EndPageRoutingModule,
    TranslateModule
  ],
  declarations: [EndPage]
})
export class EndPageModule {}
