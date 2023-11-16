import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameModePage } from './game-mode.page';

const routes: Routes = [
  {
    path: '',
    component: GameModePage
  },
  {
    path: 'game/:liveGame',
    loadChildren: () => import('./game/game.module').then( m => m.GamePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameModePageRoutingModule {}
