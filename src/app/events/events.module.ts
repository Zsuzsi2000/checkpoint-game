import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventsPageRoutingModule } from './events-routing.module';

import { EventsPage } from './events.page';
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {SharedModule} from "../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsPageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [EventsPage]
})
export class EventsPageModule {}
