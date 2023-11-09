import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateGamePage } from './create-game.page';
import {CreateCheckpointsPage} from "./create-checkpoints/create-checkpoints.page";

const routes: Routes = [
  {
    path: '',
    component: CreateGamePage,
  },
  {
    path: 'create-checkpoints',
    component: CreateCheckpointsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateGamePageRoutingModule {}
