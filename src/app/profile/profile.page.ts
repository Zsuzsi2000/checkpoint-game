import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {GamesService} from "../games/games.service";
import {UserService} from "../services/user.service";
import {AlertController, IonModal, LoadingController, ModalController, NavController} from "@ionic/angular";
import {catchError, switchMap, take} from "rxjs/operators";
import {BehaviorSubject, forkJoin, of, Subscription} from "rxjs";
import {Game} from "../models/game.model";
import {User} from "../models/user.model";
import {ActivatedRoute, Router} from "@angular/router";
import {UserData} from "../interfaces/UserData";
import {CountryService} from "../services/country.service";
import {ImageService} from "../services/image.service";
import {ImagePickerModalComponent} from "../shared/components/image-picker-modal/image-picker-modal.component";
import {PickAThingComponent} from "../shared/components/pick-a-thing/pick-a-thing.component";
import {EventsService} from "../events/events.service";
import {Event} from "../models/event.model";
import {SettingsComponent} from "../shared/components/settings/settings.component";
import {ConnectionsService} from "../connections/connections.service";
import {Request} from "../models/request.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  userIsLoading = false;
  gamesAreLoading = false;
  eventsAreLoading = false;
  loadedOwnGames: Game[];
  loadedOwnEvents: Event[]; //amiket csináltum, plusz amikre jelentkeztem
  loadedUser: UserData;
  loadedUserId: string;
  loggedUser: User;
  ownProfile = false;
  listGames = true;
  countries = [];
  userSub: Subscription;
  firstTime = false;
  canAdd = "noFriend";

  constructor(private gamesService: GamesService,
              private eventsService: EventsService,
              private userService: UserService,
              private authService: AuthService,
              private connectionService: ConnectionsService,
              private alertCtrl: AlertController,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private countryService: CountryService,
              private imageService: ImageService,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private translate: TranslateService) {
    if (this.modalCtrl.getTop()) this.modalCtrl.dismiss();
  }


  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.userIsLoading = true;
      this.gamesAreLoading = true;

      if (!paramMap.has('userId')) {
        this.userSub = this.authService.user.subscribe(currentUser => {
          if (currentUser) {
            this.ownProfile = true;
            this.loadedUserId = currentUser.id;
            this.loadedUser = {
              id: currentUser.id,
              email: currentUser.email,
              username: currentUser.username,
              country: currentUser.country,
              picture: currentUser.picture,
              favouriteGames: currentUser.favouriteGames,
              eventsUserSignedUpFor: currentUser.eventsUserSignedUpFor,
              savedEvents: currentUser.savedEvents,
              permissions: currentUser.permissions
            };
            this.userIsLoading = false;
            this.fetchLoadedUserData();
          } else {
            this.showALert();
          }
        });
      } else {
        this.ownProfile = false;
        this.loadedUserId = paramMap.get('userId');
        this.userService.getUserById(this.loadedUserId).pipe(take(1)).subscribe(
          user => {
            this.loadedUser = user;
            this.authService.user.pipe(take(1)).subscribe(currentUser => {
              if (currentUser) {
                this.loggedUser = currentUser;
                this.canAddToFriends();
                this.ownProfile = currentUser.id === this.loadedUser.id;
                this.userIsLoading = false;
                this.fetchLoadedUserData();
              } else {
                this.userIsLoading = false;
                this.fetchLoadedUserData();
              }
            });
          },
          error => {
            this.showALert();
          }
        );
      }

      this.userSub = this.authService.user.subscribe(currentUser => {
        this.loggedUser = currentUser;
      });

      this.countryService.fetchCountries().pipe(take(1)).subscribe(countries => {
        if (countries) this.countries = countries;
      });
    });
  }


  ionViewWillEnter() {
    if (this.loadedUserId && this.firstTime) {
      this.gamesAreLoading = true;
      this.eventsAreLoading = true;
      this.userIsLoading = true;
      this.userService.getUserById(this.loadedUserId).pipe(take(1)).subscribe(user => {
        this.loadedUser = user;
        this.userIsLoading = false;
        this.fetchLoadedUserData();
      }, error => {
        this.showALert();
      });
    } else {
      this.firstTime = true;
    }
  }

  fetchLoadedUserData() {
    this.authService.user.pipe(take(1)).subscribe(currentUser => {
      this.loggedUser = currentUser;
      this.canAddToFriends();
    });

    this.gamesService.fetchOwnGames(this.loadedUserId).pipe(take(1)).subscribe(games => {
      if (this.ownProfile) {
        this.loadedOwnGames = games;
      } else {
        this.connectionService.getFriends(this.loggedUser.id).pipe(take(1)).subscribe(friends => {
          this.loadedOwnGames = games.filter(game => game.itIsPublic
            || game.userId === this.loggedUser.id
            || friends.find(friend => friend.id === game.userId) !== undefined);
        });
      }
      this.gamesAreLoading = false;
    });

    this.eventsService.fetchOwnEvents(this.loadedUserId).pipe(take(1)).subscribe(events => {
      if (this.ownProfile) {
        this.loadedOwnEvents = events;
      } else {
        this.connectionService.getFriends(this.loggedUser.id).pipe(take(1)).subscribe(friends => {
          this.loadedOwnEvents = events.filter((event: Event) => event.isItPublic
            || event.creatorId === this.loggedUser.id
            || friends.find(friend => friend.id === event.creatorId) !== undefined);
        });
      }
      this.eventsAreLoading = false;
      this.fetchJoinedEvents();
    }, error => {
      this.fetchJoinedEvents();
    });
  }

  fetchJoinedEvents() {
    if (this.loadedUser.eventsUserSignedUpFor) {
      let observables = [];
      this.loadedUser.eventsUserSignedUpFor.forEach(eventId => {
        observables.push(this.eventsService.fetchEvent(eventId).pipe(
          take(1),
          catchError((error) => {
            return of(null);
          }),
          switchMap(event => {
            return of(event);
          }))
        );
      });

      forkJoin(observables).subscribe(events => {
        if (events) {
          events.forEach(event => {
            if (event instanceof Event && this.loadedOwnEvents.find(e => e.id === event.id) === undefined) {
              if (this.loadedOwnEvents) {
                this.loadedOwnEvents.push(event);
              } else {
                this.loadedOwnEvents = [event];
              }
            }
          })
        }
      })
    }
  }

  editUsernameAlert() {
    this.alertCtrl.create({
      header: this.translate.currentLang === "hu" ? "Add meg a felhasználóneved" : "Enter your new username",
      inputs: [{
        placeholder:this.translate.currentLang === "hu" ? "Új felhasználónév" : "New username",
        type: "text",
        name: "username",
        value: this.loggedUser.username
      }],
      buttons: [
        {
          text: this.translate.currentLang === "hu" ? "Vissza" : "Cancel",
          role: "cancel"
        },
        {
          text: this.translate.currentLang === "hu" ? "Mentés" : "Save",
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

  canAddToFriends() {
    this.connectionService.getFriends(this.loggedUser.id).pipe(take(1)).subscribe(friends => {
      let friend = friends ? friends.find(f => (f.id === this.loadedUser.id)) : undefined;
      this.canAdd = (friend !== undefined) ? "friend" : "noFriend";
      if (this.canAdd === "noFriend") {
        this.connectionService.getRequests(this.loggedUser.id).pipe(take(1)).subscribe(requests => {
          let find = requests ? requests.find(request => (request.senderId === this.loadedUser.id || request.receiverId === this.loadedUser.id)) : undefined;
          if (find !== undefined) {
            this.canAdd = "tagged";
          }
        });
      }
    })
  }

  createRequest() {
    let request = new Request(null, this.loggedUser.id, this.loadedUser.id);
    this.connectionService.createRequest(request).pipe(take(1)).subscribe(f => {
      this.canAdd = "tagged";
    });
  }

  updateUsername(username: string) {
    this.userService.updateUser(this.loggedUser.id, null, username, null, null, null, null).pipe(take(1)).subscribe();
  }

  updatePicture(picture: string | File) {
    const imageFile = this.onImagePick(picture);
    if (imageFile) {
      this.loadingCtrl.create({
        message: this.translate.currentLang === 'hu' ? 'Új kép készítése...' : 'Creating new image...'
      }).then(loadingEl => {
        loadingEl.present();
        this.imageService.uploadImage(imageFile).pipe(take(1), switchMap(image => {
          return this.userService.updateUser(this.loggedUser.id, null, null, null, image.imageUrl, null, null).pipe(take(1));
        })).subscribe(res => {
          loadingEl.dismiss();
        }, error => {
          loadingEl.dismiss();
        })
      });
    }
  }

  deleteProfile() {
    //TODO: delete games and events
    this.authService.deleteAccount().subscribe(
      resData => {},
      errRes => {});
    this.userService.deleteUser(this.loadedUser.id).pipe(take(1)).subscribe(res => {}, errRes => {});
  }

  startDeleteTheProfile() {
    this.alertCtrl
      .create({
        header: this.translate.currentLang === "hu"
          ? "Biztosan törölni szeretnéd a fiókod?"
          : 'Are you sure you want to delete your account?',
        message: this.translate.currentLang === "hu"
          ? "Az események és a játékok, amiket csináltál, nem lesznek elérhetőek."
          : 'The events and games you created will not be available.',
        buttons: [
          {
            text: this.translate.currentLang === "hu" ? "Vissza" : "Cancel",
            role: "cancel",
          },
          {
            text: this.translate.currentLang === "hu" ? "Törlés" : "Delete",
            role: "delete",
            handler: () => {
              this.deleteProfile();
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  updateGames(games: Game[]) {
    if (games) {
      this.loadedOwnGames = games;
    }
  }

  showALert() {
    this.alertCtrl
      .create(
        {
          header: this.translate.currentLang === "hu" ? "Hiba történt" : 'An error occured',
          message: this.translate.currentLang === "hu"
            ? "A felhasználót nem lehet lekérni. Kérem próbálja meg később."
            : 'User could not be fetched. Please try again later.',
          buttons: [{
            text: (this.translate.currentLang === "hu" ? "Rendben" : 'Okay'), handler: () => {
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

  onFilterUpdate(event) {
    this.listGames = (event.detail.value === 'games');
  }

  onImagePick(imageData: string | File | Blob) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imageService.convertbase64toBlob(imageData);
      } catch (error) {
        this.showAlert(this.translate.currentLang === 'hu' ? 'Nem megfelelő fájlformátum' : error.message);
        return;
      }
    } else {
      imageFile = imageData
    }
    return imageFile;
  }

  showAlert(message: string) {
    this.alertCtrl.create(
      {
        header: this.translate.currentLang === 'hu' ? 'Hiba történt' : 'An error occured',
        message: message,
        buttons: [this.translate.currentLang === "hu" ? "Rendben" : 'Okay']
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

  showSettings() {
    this.modalCtrl.create({component: SettingsComponent, componentProps: { user: this.loggedUser }}).then(modalEl => {
      modalEl.present();
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}

