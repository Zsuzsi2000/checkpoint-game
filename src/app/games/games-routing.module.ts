import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamesPage } from './games.page';

const routes: Routes = [
  {
    path: '',
    component: GamesPage,
    pathMatch: "full",
    // children: [
    //   {
    //     path: ':gameId',
    //     loadChildren: () => import('./game-details/game-details.module').then( m => m.GameDetailsPageModule)
    //   }
    // ]
  },
  {
    path: ':gameId',
    loadChildren: () => import('./game-details/game-details.module').then( m => m.GameDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamesPageRoutingModule {}
