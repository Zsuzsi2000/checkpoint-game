import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamesPage } from './games.page';
import {GameDetailsPage} from "./game-details/game-details.page";
import {CreateGamePage} from "./create-game/create-game.page";
import {EditGamePage} from "./edit-game/edit-game.page";


const routes: Routes = [
  // {
  //   path: 'game',
  //   children: [
  //     {
  //       path: 'edit-game',
  //       loadChildren: () => import('./edit-game/edit-game.module').then(m => m.EditGamePageModule)
  //     },
  //     {
  //       path: 'create-game',
  //       loadChildren: () => import('./create-game/create-game.module').then(m => m.CreateGamePageModule)
  //     },
  //     {
  //       path: 'details/:gameId',
  //       loadChildren: () => import('./game-details/game-details.module').then(m => m.GameDetailsPageModule)
  //     },
  //     {
  //       path: '',
  //       redirectTo: '/games',
  //       pathMatch: 'full'
  //     }
  //   ]
  // },
  // {
  //   path: '',
  //   component: GamesPage,
  //   // redirectTo: '/games',
  //   pathMatch: 'full'
  // },
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
    path: 'edit-game',
    component: EditGamePage
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
