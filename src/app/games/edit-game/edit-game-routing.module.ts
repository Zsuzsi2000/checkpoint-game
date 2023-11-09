import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditGamePage } from './edit-game.page';
import {EditCheckpointsPage} from "./edit-checkpoints/edit-checkpoints.page";

const routes: Routes = [
  {
    path: ':gameId',
    component: EditGamePage,
  },
  {
    path: 'edit-checkpoints/:gameId',
    component: EditCheckpointsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditGamePageRoutingModule {}
