import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConnectionsPage } from './connections.page';
import {ChatPage} from "./chat/chat.page";

const routes: Routes = [
  {
    path: 'tabs',
    component: ConnectionsPage,
    children: [
      {
        path: 'friends',
        loadChildren: () => import('./friends/friends.module').then( m => m.FriendsPageModule)
      },
      {
        path: 'chats',
        loadChildren: () => import('./chats/chats.module').then( m => m.ChatsPageModule)
      },
      // {
      //   path: 'chat/:chatId',
      //   component: ChatPage
      // },
      {
        path: '',
        redirectTo: '/connections/tabs/friends',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'chat/:chatId',
    component: ChatPage
  },
  {
    path: '',
    redirectTo: '/connections/tabs/friends',
    pathMatch: 'full'
  }
  // {
  //   path: 'friends',
  //   loadChildren: () => import('./friends/friends.module').then( m => m.FriendsPageModule)
  // },
  // {
  //   path: 'chats',
  //   loadChildren: () => import('./chats/chats.module').then( m => m.ChatsPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConnectionsPageRoutingModule {}
