import {Component, OnInit} from '@angular/core';
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {interval, Observable, throwError} from "rxjs";
import {NgForm} from "@angular/forms";
import {catchError, map, switchMap, take, takeWhile, tap} from "rxjs/operators";
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  isLoading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
  }

  ngOnInit() {
  }

  login(email: string, password: string) {
    this.isLoading = true;
    let idToken = "";
    let authRes: AuthResponseData;
    this.loadingCtrl
      .create({keyboardClose: true, message: 'Logging in...'})
      .then(loadingEl => {
        loadingEl.present();
        this.authService.login(email, password).pipe(
          switchMap((authResponseData: AuthResponseData) => {
            authRes = authResponseData;
            if (authResponseData.idToken) {
              return this.authService.getUserData(authResponseData.idToken).pipe(
                map((resData: { kind: any, users: any }) => {
                  const emailVerified = (resData.users[0] && resData.users[0].emailVerified) ? resData.users[0].emailVerified : false;
                  if (!emailVerified) {
                    throw new Error("EMAIL_IS_NOT_VERIFIED");
                  }
                  return authResponseData;
                })
              );
            }
          }),
          catchError((error) => {
            if (error instanceof Error && error.message === "EMAIL_IS_NOT_VERIFIED") {
              return throwError("EMAIL_IS_NOT_VERIFIED");
            }
            return throwError(error);
          })
        )
          .subscribe(
            (authResponseData: AuthResponseData) => {
              this.setUserData(authResponseData);
              this.isLoading = false;
              loadingEl.dismiss();
              this.router.navigateByUrl('/games');
            },
            (errRes) => {
              loadingEl.dismiss();
              if (errRes === 'EMAIL_IS_NOT_VERIFIED') {
                this.showAlertWithOtherButtons("The email has not been verified yet.", authRes);
              } else {
                const code = errRes.error.error.message;
                let message = 'Could not sign you up, please try again.';
                switch (code) {
                  case 'EMAIL_EXISTS':
                    message = 'This email address exists already!';
                    break;
                  case 'EMAIL_NOT_FOUND':
                    message = "E-Mail address could not be found.";
                    break;
                  case 'INVALID_PASSWORD':
                    message = "This password is not correct.";
                    break;
                  case 'INVALID_LOGIN_CREDENTIALS':
                    message = "This e-mail address or this password is not correct.";
                    break;
                }
                this.showAlert(message);
              }
            }
          );
      });
  }

  setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this.userService.getUserByEmail(userData.email).pipe(take(1)).subscribe(user => {
      let currentUser = new User(
        user.id,
        user.email,
        user.username,
        user.country,
        user.picture,
        (user.favouriteGames) ? user.favouriteGames : [],
        (user.eventsUserSignedUpFor) ? user.eventsUserSignedUpFor : [],
        userData.idToken,
        expirationTime
      );
      console.log("currentUser", currentUser);
      this.authService.setUserWhenLoggedIn(currentUser, userData.idToken, expirationTime);
    });
  }

  setNewPasswordAlert() {
    this.alertCtrl.create({
      header: "Enter your email address",
      inputs: [{
        placeholder: "Eamil",
        type: "text",
        name: "email",
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Get a new password",
          handler: (event) => {
            this.setNewPassword(event.email);
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  setNewPassword(email: string) {
    this.authService.sendPasswordResetEamil(email).subscribe(
      resData => {
        this.showAlert("You can set a new password if you follow the instructions in the email",
          "Password change email has been sent");
      },
      errRes => {
        console.log("error", errRes.error.error.message);
        this.showAlert(errRes.error.error.message);
      });
  }


  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.login(email, password);
    form.reset();
  }

  verifyEmail(authRes: AuthResponseData) {
    this.authService.verifyEmail(authRes.idToken).pipe(take(1)).subscribe(response => {
      console.log(response);
    });
  }

  private showAlert(message: string, header: string = "Authentication failed") {
    this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

  private showAlertWithOtherButtons(message: string, authRes: AuthResponseData) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Canceled, but not verified");
            }
          },
          {
            text: "Verify",
            role: "verify",
            handler: () => {
              this.verifyEmail(authRes);
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

}
