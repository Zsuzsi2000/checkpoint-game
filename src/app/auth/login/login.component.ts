import {Component, OnInit} from '@angular/core';
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {interval, Observable, throwError} from "rxjs";
import {NgForm} from "@angular/forms";
import {catchError, map, switchMap, takeWhile, tap} from "rxjs/operators";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  isLoading = false;

  constructor(
    private authService: AuthService,
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
              this.authService.setUserData(authResponseData, "", "", "");
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
    this.isLoading = true;
    this.loadingCtrl.create({keyboardClose: true, message: 'Sending an email to you...',}).then(loadingEl => {
        loadingEl.present();
        let doItAgain = true;

        this.authService.sendEmailVerification(authRes.idToken).pipe(
          switchMap(() => {
            loadingEl.message = "Please verify your email";

            return interval(5000).pipe(
              switchMap((l) => {
                return this.authService.getUserData(authRes.idToken);
              }),
              takeWhile((resData: { kind: any, users: any }) => (!resData.users[0]?.emailVerified || doItAgain)) // Continue until email is verified
            );
          })
        ).subscribe(
          (resData: { kind: any, users: any }) => {
            console.log("users", resData.users)
            if (resData.users && resData.users[0].emailVerified) {
              console.log("setData");
              doItAgain = false;
              this.authService.setUserData(authRes, "", "", "");
              this.isLoading = false;
              loadingEl.dismiss();
              this.showAlert("Email verification was successful!");
            }
          },
          errRes => {
            const code = errRes.error.error.message;
            let message = (code === 'EMAIL_EXISTS')
              ? 'This email address exists already!'
              : 'Could not sign you up, please try again.';
            this.showAlert(message);
          }
        );
      }
    );
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
