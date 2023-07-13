import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Profil', url: '/folder/Profile', icon: 'mail' },
    { title: 'Események', url: '/folder/Events', icon: 'paper-plane' },
    { title: 'Pótlás', url: '/folder/Substitution', icon: 'trash' },
    { title: 'Bejelentkezés', url: '/folder/SignIn', icon: 'heart' },
    { title: 'Regisztráció', url: '/folder/Regist', icon: 'archive' }
  ];
  constructor() {}
}
