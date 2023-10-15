import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FriendsPage } from './friends.page';
import {NewPage} from './new/new.page';
import {RequestsPage} from './requests/requests.page';

const routes: Routes = [
  {
    path: '',
    component: FriendsPage
  },
  {
    path: 'new',
    component: NewPage,
  },
  {
    path: 'requests',
    component: RequestsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FriendsPageRoutingModule {}
