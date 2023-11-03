import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamesPage } from './games.page';
import {GameDetailsPage} from "./game-details/game-details.page";
import {CreateGamePage} from "./create-game/create-game.page";
import {EditGamePage} from "./edit-game/edit-game.page";
import {CreateCheckpointsPage} from "./create-game/create-checkpoints/create-checkpoints.page";
import {EditCheckpointsPage} from "./edit-game/edit-checkpoints/edit-checkpoints.page";


const routes: Routes = [
  {
    path: '',
    component: GamesPage,
    pathMatch: "full"
  },
  {
    path: 'details/:gameId',
    component: GameDetailsPage
  },
  {
    path: 'create-game',
    component: CreateGamePage
  },
  {
    path: 'edit-game/:gameId',
    component: EditGamePage
  },
  {
    path: 'create-game/create-checkpoints',
    component: CreateCheckpointsPage
  },
  {
    path: 'edit-game/edit-checkpoints/:gameId',
    component: EditCheckpointsPage
  },
  // {
  //   path: '',
  //   redirectTo: '/games',
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamesPageRoutingModule {}
