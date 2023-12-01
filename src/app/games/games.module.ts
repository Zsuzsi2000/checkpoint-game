import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GamesPageRoutingModule } from './games-routing.module';
import { GamesPage } from './games.page';
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {GameDetailsPage} from "./game-details/game-details.page";
import {SharedModule} from "../shared/shared.module";
import {QRCodeModule} from "angularx-qrcode";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamesPageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule,
    QRCodeModule,
    TranslateModule
  ],
  declarations: [
    GamesPage,
    GameDetailsPage,
  ]
})
export class GamesPageModule {}
