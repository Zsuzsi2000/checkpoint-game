import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {EditGamePage} from "./edit-game.page";
import {SharedModule} from "../../shared/shared.module";
import {EditCheckpointsPage} from "./edit-checkpoints/edit-checkpoints.page";
import {EditGamePageRoutingModule} from "./edit-game-routing.module";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditGamePageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [
    EditGamePage,
    EditCheckpointsPage,
  ]
})
export class EditGamePageModule {}
