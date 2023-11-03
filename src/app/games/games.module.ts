import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GamesPageRoutingModule } from './games-routing.module';
import { GamesPage } from './games.page';
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {EditGamePage} from "./edit-game/edit-game.page";
import {GameDetailsPage} from "./game-details/game-details.page";
import {CreateGamePage} from "./create-game/create-game.page";
import {SharedModule} from "../shared/shared.module";
import {CreateCheckpointsPage} from "./create-game/create-checkpoints/create-checkpoints.page";
import {EditCheckpointsPage} from "./edit-game/edit-checkpoints/edit-checkpoints.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamesPageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    GamesPage,
    EditGamePage,
    GameDetailsPage,
    CreateGamePage,
    CreateCheckpointsPage,
    EditCheckpointsPage
  ]
})
export class GamesPageModule {}
