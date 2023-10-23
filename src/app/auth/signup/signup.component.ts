import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm, ValidatorFn} from "@angular/forms";
import {interval, Observable} from "rxjs";
import {AuthResponseData, AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, IonModal, LoadingController} from "@ionic/angular";
import {CountryService} from "../../services/country.service";
import {concatMap, first, switchMap, take, takeUntil, takeWhile} from "rxjs/operators";
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

  @ViewChild('modal', {static: true}) modal!: IonModal;

  profileForm: FormGroup;
  isLoading = false;
  countries = [];
  selectedCountry: string = "";
  fileName: string;

  constructor(
    private authService: AuthService,
    private countryService: CountryService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private fb: FormBuilder
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
      picture: new FormControl(null, {updateOn: "blur"}),
    }, { validator: passwordMatchValidator });
    this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    // this.countryService.getAllCountries().subscribe(res => {
    //   for (var key in res) {
    //     this.countries.push(res[key].name);
    //   }
    // });
  }

  signUp(email: string, password: string, username: string, country: string, picture: string) {

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
            console.log("users", resData.users)
            if (resData.users && resData.users[0].emailVerified) {
              doItAgain = false;
              console.log("setData");
              this.authService.createUser(authRes, username, country, picture).subscribe(data => {
                console.log("user", data);
              });
              this.isLoading = false;
              loadingEl.dismiss();
              this.showAlert("Email verification was successful!", "Authentication succeeded");
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
    const picture = this.profileForm.get('picture').value;

    this.signUp(email, password, username, country, picture);
    this.profileForm.reset();
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      const formData = new FormData();

      formData.append("thumbnail", file);

      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      //
      // upload$.subscribe();
    }
  }

  countrySelectionChanged(country: string) {
    console.log("countrySelectionChanged", country);
    this.selectedCountry = country;
    this.modal.dismiss();
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
