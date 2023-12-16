import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
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
export class AuthPage implements OnInit, OnDestroy {

  isLoading = false;
  status: AuthStatus;
  AuthStatus = AuthStatus;
  authSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router) {
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

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
