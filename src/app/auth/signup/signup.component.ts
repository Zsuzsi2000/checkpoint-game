import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ValidatorFn} from "@angular/forms";
import {interval} from "rxjs";
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, IonModal, LoadingController, ModalController} from "@ionic/angular";
import {CountryService} from "../../services/country.service";
import {switchMap, take, takeWhile} from "rxjs/operators";
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {UserService} from "../../services/user.service";
import {PickAThingComponent} from "../../shared/components/pick-a-thing/pick-a-thing.component";
import {TranslateService} from "@ngx-translate/core";

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password').value;
  const confirmPassword = control.get('passwordAgain').value;

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  @Output() switchToLogIn = new EventEmitter<null>();

  profileForm: FormGroup;
  isLoading = false;
  countries = [];
  selectedCountry: string = "";
  fileName: string;
  currentLanguage: string;

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) {
    this.currentLanguage = this.translate.currentLang;
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      email: new FormControl(null,{updateOn: "blur",
        validators: [Validators.required, Validators.email]}),
      username: new FormControl(null, {updateOn: "blur",
        validators:[Validators.required]}),
      password: new FormControl(null, {updateOn: "blur",
        validators: [Validators.required, Validators.minLength(6)]}),
      passwordAgain: new FormControl(null, {updateOn: "blur",
        validators: [Validators.required, Validators.minLength(6)]}),
    }, { validator: passwordMatchValidator });

    this.countryService.fetchCountries().pipe(take(1)).subscribe(countries => {
      if (countries) this.countries = countries;
    })
  }

  signUp(email: string, password: string, username: string, country: string) {

    this.isLoading = true;
    this.loadingCtrl.create({ keyboardClose: true, message: this.translate.currentLang === "hu" ? "Regisztráció..." : 'Signing up...',  }).then(loadingEl => {
      loadingEl.present();
      let doItAgain = true;

      let authRes: AuthResponseData;
      this.authService.signup(email, password)
        .pipe(
          take(1),
          switchMap(resData => {
            authRes = resData;

            return this.authService.sendEmailVerification(resData.idToken).pipe(
              switchMap(() => {
                loadingEl.message = this.translate.currentLang === "hu" ? "Kérlek igazold az email címed" : "Please verify your email";

                return interval(5000).pipe(
                  switchMap((l) => {
                    const res = this.authService.getUserData(resData.idToken);
                    return res;
                  }),
                  takeWhile((resData: {kind: any, users: any}) => (!resData.users[0]?.emailVerified || doItAgain))
                );
              })
            );
          })
        )
        .subscribe(
          (resData: {kind: any, users: any}) => {
            if (resData.users && resData.users[0].emailVerified) {
              doItAgain = false;
              this.isLoading = false;
              loadingEl.dismiss();
              this.showAlert(this.translate.currentLang === "hu" ? "Email cím ellenőrzés sikeres volt" : "Email verification was successful!",
                this.translate.currentLang === "hu" ? "Autentikáció sikeres volt" : "Authentication succeeded");
              this.userService.createUser(authRes, username, country).pipe(take(1)).subscribe(data => {
                this.switchToLogIn.emit();
              });
            }
          },
          errRes => {
            const code = errRes.error.error.message;
            let message = (code === 'EMAIL_EXISTS')
              ? (this.translate.currentLang === "hu" ? "Az email cím már létezik!" :'This email address exists already!')
              : (this.translate.currentLang === "hu" ? "Nem sikerült beregisztrálni, kérem próbálja újra." : 'Could not sign you up, please try again.');
            this.showAlert(message);
          }
        );
    });
  }


  onSubmit() {
    if (!this.profileForm.valid) {
      return;
    }

    const email = this.profileForm.get('email').value;
    const password = this.profileForm.get('password').value;
    const username = this.profileForm.get('username').value;
    const country = this.selectedCountry;

    this.signUp(email, password, username, country);
    this.profileForm.reset();
  }

  selectCountry() {
    this.modalCtrl.create({ component: PickAThingComponent, componentProps: {
        countries: this.countries,
        selectedCountry: this.selectedCountry
      }}).then(modalEl => {
      modalEl.onDidDismiss().then(modal => {
        if (modal.data) {
          this.selectedCountry = modal.data;
        }
      });
      modalEl.present();
    })
  }

  private showAlert(message: string, header: string = this.translate.currentLang === "hu" ? "Autentikáció sikertelen volt" :'Authentication failed') {
    this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: [this.translate.currentLang === "hu" ? "Rendben" : 'Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
