import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Profil', url: '/folder/Profile', icon: 'mail' },
    { title: 'Játékok', url: '/folder/Games', icon: 'paper-plane' },
    { title: 'Események', url: '/folder/Events', icon: 'trash' },
    { title: 'Alkotás', url: '/folder/Creation', icon: 'heart' },
    { title: 'Ismerősök', url: '/folder/Friends', icon: 'archive' },
    { title: 'Csevegések', url: '/folder/Chats', icon: 'archive' },
    { title: 'Naptár', url: '/folder/Calendar', icon: 'archive' },
    { title: 'Bejelentkezés', url: '/folder/SignIn', icon: 'archive' },
  ];
  constructor() {}
}
