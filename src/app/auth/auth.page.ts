import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {LoadingController, AlertController} from '@ionic/angular';
import {AuthResponseData, AuthService} from './auth.service';
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {tryCatch} from "rxjs/internal-compatibility";

enum AuthStatus {
  modeSelection,
  login,
  signup,
  loginAsGuest,
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
  }

  ngOnInit() {
    this.status = AuthStatus.modeSelection;
  }

  // authenticate(email: string, password: string) {
  //   this.isLoading = true;
  //   this.loadingCtrl
  //     .create({keyboardClose: true, message: 'Logging in...'})
  //     .then(loadingEl => {
  //       loadingEl.present();
  //       let authObs: Observable<AuthResponseData> = (this.status === AuthStatus.login) ? this.authService.login(email, password) : this.authService.signup(email, password);
  //       authObs.subscribe(
  //         resData => {
  //
  //           // this.authService.sendEmailVerification().subscribe(email => {
  //           //   console.log("sendEmailVerification", email);
  //           // });
  //           console.log("resData", resData);
  //           this.isLoading = false;
  //           loadingEl.dismiss();
  //           this.router.navigateByUrl('/connections/tabs/friends');
  //         },
  //         errRes => {
  //           console.log("error", errRes.error.error.message);
  //           loadingEl.dismiss();
  //           const code = errRes.error.error.message;
  //           let message = 'Could not sign you up, please try again.';
  //           switch (code) {
  //             case 'EMAIL_EXISTS': {
  //               message = 'This email address exists already!';
  //               break;
  //             }
  //             case 'EMAIL_NOT_FOUND': {
  //               message = "E-Mail address could not be found.";
  //               break;
  //             }
  //             case 'INVALID_PASSWORD': {
  //               message = "This password is not correct.";
  //               break;
  //             }
  //             case 'INVALID_LOGIN_CREDENTIALS': {
  //               message = "This e-mail address or this password is not correct.";
  //               break;
  //             }
  //             case 'EMAIL_IS_NOT_VERIFIED': {
  //               message = "This e-mail hasn't verified yet.";
  //               break;
  //             }
  //           }
  //           this.showAlert(message);
  //         }
  //       );
  //     });
  // }

  updateStatus(newStatus: AuthStatus) {
    this.status = newStatus;
  }

  setNewPassword() {
    this.authService.sendPasswordResetEamil("zsuzsi753@gmail.com").subscribe(
      resData => {
        console.log("setNewPassword", resData);
        this.showAlert("New password sent");
      },
      errRes => {
        console.log("error", errRes.error.error.message);
        this.showAlert(errRes.error.error.message);
      });
  }

  logout() {
    this.authService.logout();
    this.updateStatus(AuthStatus.modeSelection);
  }


  logInAsAGuest() {
    this.authService.loginAsAGuest().subscribe(
      resData => {
        console.log("logInAsAGuest", resData);
      },
      errRes => {
        console.log("error", errRes.error.error.message);
      });
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
