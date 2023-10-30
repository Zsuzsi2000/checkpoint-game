import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "./auth/auth.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'games',
    loadChildren: () => import('./games/games.module').then( m => m.GamesPageModule),
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule),
  },
  {
    path: 'connections',
    loadChildren: () => import('./connections/connections.module').then( m => m.ConnectionsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'profile/:userId',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
  },
  {
    path: 'profile',
    pathMatch: 'full',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'game-mode',
    loadChildren: () => import('./game-mode/game-mode.module').then( m => m.GameModePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
