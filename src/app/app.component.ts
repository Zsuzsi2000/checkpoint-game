import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {take} from "rxjs/operators";
import {Capacitor} from "@capacitor/core";
import {Platform} from "@ionic/angular";
import {SplashScreen} from "@capacitor/splash-screen";
import {App, AppState} from "@capacitor/app";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  public appPages;
  langSub: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private platform: Platform,
              private translate: TranslateService) {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }
    });
    this.translate.setDefaultLang('hu');
    this.translate.use('hu');
    let hu = this.translate.currentLang === 'hu';
    this.appPages = [
        { title: hu ? 'Játékok' : 'Games', url: '/games', icon: 'dice' },
        { title: hu ? 'Események' :'Events', url: '/events', icon: 'calendar' },
        { title: hu ? 'Profil' : 'Profile', url: '/profile', icon: 'person' },
        { title: hu ? 'Kapcsolatok' : 'Connections', url: '/connections', icon: 'people' },
        { title: hu ? 'Autentikáció' : 'Authentication', url: '/auth', icon: 'log-in' },
        { title: hu ? 'Játékmód' : 'Game mode', url: '/game-mode', icon: 'game-controller' },
    ];
  }

  ngOnInit(): void {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });

    App.addListener('appStateChange', this.checkAuthOnResume.bind(this));

    this.langSub = this.translate.onLangChange.subscribe(lang => {
      let hu = this.translate.currentLang === 'hu';
      this.appPages = [
        { title: hu ? 'Játékok' : 'Games', url: '/games', icon: 'dice' },
        { title: hu ? 'Események' :'Events', url: '/events', icon: 'calendar' },
        { title: hu ? 'Profil' : 'Profile', url: '/profile', icon: 'person' },
        { title: hu ? 'Kapcsolatok' : 'Connections', url: '/connections', icon: 'people' },
        { title: hu ? 'Autentikáció' : 'Authentication', url: '/auth', icon: 'log-in' },
        { title: hu ? 'Játékmód' : 'Game mode', url: '/game-mode', icon: 'game-controller' },
      ];
    })
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.langSub) {
      this.langSub.unsubscribe();
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
