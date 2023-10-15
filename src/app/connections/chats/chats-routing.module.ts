import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatsPage } from './chats.page';

const routes: Routes = [
  {
    path: '',
    component: ChatsPage
  },
  {
    path: 'create-chat',
    loadChildren: () => import('./create-chat/create-chat.module').then( m => m.CreateChatPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatsPageRoutingModule {}
