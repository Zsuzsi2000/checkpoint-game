import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {CreateGamePage} from "./create-game.page";
import {SharedModule} from "../../shared/shared.module";
import {CreateCheckpointsPage} from "./create-checkpoints/create-checkpoints.page";
import {CreateGamePageRoutingModule} from "./create-game-routing.module";
import {QRCodeModule} from "angularx-qrcode";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateGamePageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule,
    QRCodeModule
  ],
  declarations: [
    CreateGamePage,
    CreateCheckpointsPage,
  ]
})
export class CreateGamePageModule {}
