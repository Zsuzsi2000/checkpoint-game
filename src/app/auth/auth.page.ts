import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoadingController, AlertController} from '@ionic/angular';
import {AuthService} from './auth.service';
import {Subscription} from "rxjs";
import { TranslateService } from '@ngx-translate/core';

enum AuthStatus {
  modeSelection,
  login,
  signup,
  loggedIn
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading = false;
  status: AuthStatus;
  AuthStatus = AuthStatus;
  authSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(token => {
      if (token) {
        this.status = AuthStatus.loggedIn;
      } else {
        this.status = AuthStatus.modeSelection;
      }
    });
  }

  updateStatus(newStatus: AuthStatus) {
    this.status = newStatus;
  }

  logout() {
    this.authService.logout();
    this.updateStatus(AuthStatus.modeSelection);
  }

  logInAsAGuest() {
    this.router.navigate(['/', 'games']);
  }
}
