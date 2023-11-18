import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AppState} from "@capacitor/app";
import {take} from "rxjs/operators";
import {Capacitor} from "@capacitor/core";
import {Platform} from "@ionic/angular";
import {SplashScreen} from "@capacitor/splash-screen";
import {App} from "@capacitor/app";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  public appPages = [
    { title: 'Játékok', url: '/games', icon: 'dice' },
    { title: 'Események', url: '/events', icon: 'calendar' },
    { title: 'Profil', url: '/profile', icon: 'person' },
    { title: 'Kapcsolatok', url: '/connections', icon: 'people' },
    { title: 'Authentikáció', url: '/auth', icon: 'log-in' },
    { title: 'Játékmód', url: '/game-mode', icon: 'game-controller' },
  ];

  constructor(private authService: AuthService,
              private router: Router,
              private platform: Platform) {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }
    })
  }

  ngOnInit(): void {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });

    App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
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
