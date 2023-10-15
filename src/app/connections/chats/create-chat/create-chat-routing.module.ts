import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateChatPage } from './create-chat.page';

const routes: Routes = [
  {
    path: '',
    component: CreateChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateChatPageRoutingModule {}
