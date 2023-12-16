import {Component, OnInit} from '@angular/core';
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {interval, Observable, throwError} from "rxjs";
import {NgForm} from "@angular/forms";
import {catchError, map, switchMap, take, takeWhile, tap} from "rxjs/operators";
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  isLoading = false;
  currentLanguage: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {
    this.currentLanguage = this.translate.currentLang;
  }

  ngOnInit() {
  }

  login(email: string, password: string) {
    this.isLoading = true;
    let authRes: AuthResponseData;
    this.loadingCtrl
      .create({keyboardClose: true, message: this.translate.currentLang === 'hu' ? 'Bejelentkezés...' : 'Logging in...'})
      .then(loadingEl => {
        loadingEl.present();
        this.authService.login(email, password).pipe(
          take(1),
          switchMap((authResponseData: AuthResponseData) => {
            authRes = authResponseData;
            if (authResponseData.idToken) {
              return this.authService.getUserData(authResponseData.idToken).pipe(
                take(1),
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
                this.showAlertWithOtherButtons(this.translate.currentLang === "hu" ? "Az email cím még nem lett ellenőrizve" : "The email has not been verified yet.", authRes);
              } else {
                const code = errRes.error.error.message;
                let message = this.translate.currentLang === 'hu' ? 'Nem sikerült beregisztrálni, kérem próbálja újra.' : 'Could not sign you up, please try again.';
                switch (code) {
                  case 'EMAIL_EXISTS':
                    message = this.translate.currentLang === 'hu' ? 'Ez az email cím már létezik.' : 'This email address exists already!';
                    break;
                  case 'EMAIL_NOT_FOUND':
                    message = this.translate.currentLang === 'hu' ? 'Az email cím nem található.' : "E-Mail address could not be found.";
                    break;
                  case 'INVALID_PASSWORD':
                    message = this.translate.currentLang === 'hu' ? 'A jelszó nem megfelelő.' : "This password is not correct.";
                    break;
                  case 'INVALID_LOGIN_CREDENTIALS':
                    message = this.translate.currentLang === 'hu' ? 'Az email cím vagy a jelszó nem megfelelő.' : "This e-mail address or this password is not correct.";
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
        (user.savedEvents) ? user.savedEvents : [],
        user.permissions ? user.permissions : {
          message: true,
          friendRequests: true,
          eventReminder: true
        },
        userData.idToken,
        expirationTime
      );
      this.authService.setUserWhenLoggedIn(currentUser, userData.idToken, expirationTime);
    });
  }

  setNewPasswordAlert() {
    this.alertCtrl.create({
      header: this.translate.currentLang === "hu" ? "Add meg az email címed" : "Enter your email address",
      inputs: [{
        placeholder: "Email",
        type: "text",
        name: "email",
      }],
      buttons: [
        {
          text: this.translate.currentLang === "hu" ? "Vissza" : "Cancel",
          role: "cancel"
        },
        {
          text: this.translate.currentLang === "hu" ? "Új jelszó beállítása" : "Get a new password",
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
    this.authService.sendPasswordResetEmail(email).subscribe(
      resData => {
        this.showAlert(this.translate.currentLang === "hu"
          ? "Be tudsz állítani egy új jelszót, ha követed az emailben kapott utasításokat."
          : "You can set a new password if you follow the instructions in the email.",
          this.translate.currentLang === "hu"
            ? "A jelszó megváltoztató email el lett küldve"
            : "Password change email has been sent");
      },
      errRes => {
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
    this.authService.verifyEmail(authRes.idToken).pipe(take(1)).subscribe();
  }

  private showAlert(message: string, header: string = this.translate.currentLang === "hu" ? "Autentikáció nem sikerült" : "Authentication failed") {
    this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: [this.translate.currentLang === "hu" ? 'Rendben' : 'Okay']
      })
      .then(alertEl => alertEl.present());
  }

  private showAlertWithOtherButtons(message: string, authRes: AuthResponseData) {
    this.alertCtrl
      .create({
        header: this.translate.currentLang === "hu" ? "Autentikáció nem sikerült" : 'Authentication failed',
        message: message,
        buttons: [
          {
            text: this.translate.currentLang === "hu" ? "Vissza" : "Cancel",
            role: "cancel"
          },
          {
            text: this.translate.currentLang === "hu" ? "Ellenőrzés" : "Verify",
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
