import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsPage } from './events.page';
import {AuthGuard} from "../auth/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: EventsPage,
    pathMatch: "full"
  },
  {
    path: 'create-event',
    loadChildren: () => import('./create-event/create-event.module').then( m => m.CreateEventPageModule),
    // canLoad: [AuthGuard]
  },
  {
    path: 'edit-event/:eventId',
    loadChildren: () => import('./edit-event/edit-event.module').then( m => m.EditEventPageModule)
  },
  {
    path: ':eventId',
    loadChildren: () => import('./event-details/event-details.module').then( m => m.EventDetailsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsPageRoutingModule {}
