import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AppState} from "@capacitor/app";
import {take} from "rxjs/operators";
import {Plugins} from "@capacitor/core";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  public appPages = [
    { title: 'Játékok', url: '/games', icon: 'game-controller' },
    { title: 'Események', url: '/events', icon: 'calendar' },
    { title: 'Profil', url: '/profile', icon: 'person' },
    { title: 'Kapcsolatok', url: '/connections', icon: 'people' },
    { title: 'Authentikáció', url: '/auth', icon: 'archive' },
    { title: 'Játékmód', url: '/game-mode', icon: 'archive' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });

    //TODO: megérteni 279.lecke
    // Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onLogout() {
    this.authService.logout();
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
