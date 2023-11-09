import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {GamesService} from "../games/games.service";
import {UserService} from "../services/user.service";
import {AlertController, IonModal, LoadingController, ModalController, NavController} from "@ionic/angular";
import {switchMap, take} from "rxjs/operators";
import {BehaviorSubject, Subscription} from "rxjs";
import {Game} from "../models/game.model";
import {User} from "../models/user.model";
import {ActivatedRoute, Router} from "@angular/router";
import {UserData} from "../interfaces/UserData";
import {SegmentChangeEventDetail} from '@ionic/core';
import {CountryService} from "../services/country.service";
import {ImageService} from "../services/image.service";
import {ImagePickerModalComponent} from "../shared/components/image-picker-modal/image-picker-modal.component";
import {PickAThingComponent} from "../shared/components/pick-a-thing/pick-a-thing.component";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  userIsLoading = false;
  gamesAreLoading = false;
  loadedOwnGames: Game[];
  loadedUser: UserData;
  loadedUserId: string;
  loggedUser: User;
  ownProfile = false;
  listGames = true;
  countries = [];
  userSub: Subscription;
  firstTime = false;

  constructor(private gamesService: GamesService,
              private userService: UserService,
              private authService: AuthService,
              private alertCtrl: AlertController,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private countryService: CountryService,
              private imageService: ImageService,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController) {
  }


  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.userIsLoading = true;
      this.gamesAreLoading = true;

      if (!paramMap.has('userId')) {
        this.authService.user.subscribe(currentUser => {
          if (currentUser) {
            this.ownProfile = true;
            this.loadedUserId = currentUser.id;
            this.loadedUser = {
              id: currentUser.id,
              email: currentUser.email,
              username: currentUser.username,
              country: currentUser.country,
              picture: currentUser.picture,
              favouriteGames: currentUser.favouriteGames
            };
            this.userIsLoading = false;
          } else {
            this.showALert();
          }
        });
      } else {
        this.ownProfile = false;
        this.loadedUserId = paramMap.get('userId');
        this.userService.getUserById(this.loadedUserId).subscribe(
          user => {
            this.loadedUser = user;
            this.userIsLoading = false;
          },
          error => {
            console.log("getUserError", error);
            this.showALert();
          }
        );
      }

      this.authService.user.subscribe(currentUser => {
        this.loggedUser = currentUser;
      });

      this.gamesService.fetchOwnGames(this.loadedUserId).subscribe(games => {
        this.loadedOwnGames = games;
        this.gamesAreLoading = false;
      });

      this.countries = ["1", "2", "3", "4", "5", "6", "7"];
      // TODO: Uncomment the code below to fetch countries
      // this.countryService.getAllCountries().subscribe(res => {
      //   for (var key in res) {
      //     this.countries.push(res[key].name);
      //   }
      // });
    });
  }


  ionViewWillEnter() {
    if (this.loadedUserId && this.firstTime) {
      this.gamesAreLoading = true;
      this.userIsLoading = true;
      this.userService.getUserById(this.loadedUserId).subscribe(user => {
        this.loadedUser = user;
        this.userIsLoading = false;
      }, error => {
        console.log("getUserError", error);
        this.showALert();
      });
      this.gamesService.fetchOwnGames(this.loadedUserId).subscribe(games => {
        this.loadedOwnGames = games;
        this.gamesAreLoading = false;
      });
    } else {
      this.firstTime = true;
    }
  }

  editUsernameAlert() {
    this.alertCtrl.create({
      header: "Enter your new username",
      inputs: [{
        placeholder: "New username",
        type: "text",
        name: "username",
        value: this.loggedUser.username
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Save",
          handler: (event) => {
            this.updateUsername(event.username);
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    )
  }

  togglePicture() {
    this.modalCtrl.create({ component: ImagePickerModalComponent, componentProps: { loadedPicture: this.loadedUser.picture}}).then(modaEl => {
      modaEl.onDidDismiss().then(modalData => {
        if (modalData.data) {
          this.updatePicture(modalData.data)
        }
      });
      modaEl.present();
    });
  }

  updateUsername(username: string) {
    this.userService.updateUser(this.loggedUser.id, null, username, null, null, null, null).pipe(take(1)).subscribe(response => {
      console.log("response", response);
    })
  }

  updatePicture(picture: string | File) {
    const imageFile = this.onImagePick(picture);
    if (imageFile) {
      this.loadingCtrl.create({
        message: 'Creating new image...'
      }).then(loadingEl => {
        loadingEl.present();
        this.imageService.uploadImage(imageFile).pipe(switchMap(image => {
          return this.userService.updateUser(this.loggedUser.id, null, null, null, image.imageUrl, null, null).pipe(take(1));
        })).subscribe(res => {
          console.log("res", res);
          loadingEl.dismiss();
        }, error => {
          console.log("error", error);
          loadingEl.dismiss();
        })
      });
    }
  }

  deleteProfile() {
    //TODO: delete games and events
    this.authService.deleteAccount().subscribe(
      resData => {
        console.log("deleteAccount1", resData);
      },
      errRes => {
        console.log("error", errRes.error.error.message);
      });
    this.userService.deleteUser(this.loadedUser.id).subscribe(resData => {
        console.log("deleteAccount2", resData);
      },
      errRes => {
        console.log("error", errRes.error.error.message);
      });
  }

  startDeleteTheProfile() {
    this.alertCtrl
      .create({
        header: 'Are you sure you want to delete your account?',
        message: 'The events and games you created will not be available.',
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Delete",
            role: "delete",
            handler: () => {
              this.deleteProfile();
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  deleteGame(id: string) {
    this.alertCtrl.create({
      header: "Delete game",
      message: "Are you sure you want to delete the game?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => {
            this.gamesService.deleteGame(id).subscribe(res => {
              this.gamesService.fetchOwnGames(this.loadedUserId).subscribe(games => {
                this.loadedOwnGames = games;
              });
            });
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  editGame(id: string) {
    this.router.navigate(['/', 'games', 'edit-game', id]);
  }

  showALert() {
    this.alertCtrl
      .create(
        {
          header: 'An error occured',
          message: 'User could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.navCtrl.pop();
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  selectCountry() {
    this.modalCtrl.create({ component: PickAThingComponent, componentProps: {
        countries: this.countries,
        selectedCountry: this.loggedUser.country
      }}).then(modalEl => {
      modalEl.onDidDismiss().then(modal => {
        if (modal.data) {
          this.userService.updateUser(
            this.loggedUser.id,
            null,
            null,
            modal.data,
            null,
            null,
            null
          ).pipe(take(1)).subscribe();
        }
      });
      modalEl.present();
    })
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.listGames = (event.detail.value === 'games');
  }

  onImagePick(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imageService.convertbase64toBlob(imageData);
      } catch (error) {
        console.log("error", error);
        return;
      }
    } else {
      imageFile = imageData
    }
    return imageFile;
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}

