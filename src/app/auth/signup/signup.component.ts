import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ValidatorFn} from "@angular/forms";
import {interval} from "rxjs";
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, IonModal, LoadingController, ModalController} from "@ionic/angular";
import {CountryService} from "../../services/country.service";
import {switchMap, takeWhile} from "rxjs/operators";
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {UserService} from "../../services/user.service";
import {PickAThingComponent} from "../../shared/components/pick-a-thing/pick-a-thing.component";

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

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
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
    this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    // this.countryService.getAllCountries().subscribe(res => {
    //   for (var key in res) {
    //     this.countries.push(res[key].name);
    //   }
    // });
  }

  signUp(email: string, password: string, username: string, country: string) {

    this.isLoading = true;
    this.loadingCtrl.create({ keyboardClose: true, message: 'Signing up...',  }).then(loadingEl => {
      loadingEl.present();
      let doItAgain = true;

      let authRes: AuthResponseData;
      this.authService.signup(email, password)
        .pipe(
          switchMap(resData => {
            authRes = resData;

            return this.authService.sendEmailVerification(resData.idToken).pipe(
              switchMap(() => {
                loadingEl.message = "Please verify your email";

                return interval(5000).pipe(
                  switchMap((l) => {
                    const res = this.authService.getUserData(resData.idToken);
                    console.log("in switchmap", l);
                    return res;
                  }),
                  takeWhile((resData: {kind: any, users: any}) => (!resData.users[0]?.emailVerified || doItAgain)) // Continue until email is verified
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
              this.showAlert("Email verification was successful!", "Authentication succeeded");
              this.userService.createUser(authRes, username, country).subscribe(data => {
                console.log("user", data);
                this.switchToLogIn.emit();
              });
            }
          },
          errRes => {
            console.error('Error during signup:', errRes);
            const code = errRes.error.error.message;
            let message = (code === 'EMAIL_EXISTS')
              ? 'This email address exists already!'
              : 'Could not sign you up, please try again.';
            this.showAlert(message);
          }
        );
    });
  }


  onSubmit() {
    console.log("user", this.profileForm.valid, this.profileForm.value);
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
          console.log("countrySelectionChanged", modal.data);
          this.selectedCountry = modal.data;
        }
      });
      modalEl.present();
    })
  }

  private showAlert(message: string, header: string = 'Authentication failed') {
    this.alertCtrl
      .create({
        header: header,
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
