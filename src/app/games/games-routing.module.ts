import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamesPage } from './games.page';
import {GameDetailsPage} from "./game-details/game-details.page";
import {AuthGuard} from "../auth/auth.guard";


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
    loadChildren: () => import('./create-game/create-game.module').then( m => m.CreateGamePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'edit-game',
    loadChildren: () => import('./edit-game/edit-game.module').then( m => m.EditGamePageModule),
    canLoad: [AuthGuard]
  },
  // {
  //   path: 'create-game/create-checkpoints',
  //   component: CreateCheckpointsPage,
  //   canLoad: [AuthGuard]
  // },
  // {
  //   path: 'edit-game/edit-checkpoints/:gameId',
  //   component: EditCheckpointsPage,
  //   canLoad: [AuthGuard]
  // },
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
