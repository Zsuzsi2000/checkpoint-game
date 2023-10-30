import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {GamesService} from "../games/games.service";
import {UserService} from "../services/user.service";
import {AlertController, IonModal, NavController} from "@ionic/angular";
import {take} from "rxjs/operators";
import {BehaviorSubject, Subscription} from "rxjs";
import {Game} from "../models/game.model";
import {User} from "../models/user.model";
import {ActivatedRoute, Router} from "@angular/router";
import {UserData} from "../interfaces/UserData";
import {SegmentChangeEventDetail} from '@ionic/core';
import {CountryService} from "../services/country.service";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  @ViewChild('modal', {static: true}) modal!: IonModal;

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
              private countryService: CountryService) {
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
      // Uncomment the code below to fetch countries
      // this.countryService.getAllCountries().subscribe(res => {
      //   for (var key in res) {
      //     this.countries.push(res[key].name);
      //   }
      // });
    });
  }

    // ngOnInit() {
    //   this.activatedRoute.paramMap.subscribe(paramMap => {
    //     if (!paramMap.has('userId')) {
    //       console.log("userId", "Userid missing");
    //       this.showALert();
    //       return;
    //     }
    //     this.userIsLoading = true;
    //     this.gamesAreLoading = true;
    //     this.loadedUserId = paramMap.get('userId');
    //
    //     this.userSub = this.authService.user.subscribe(currentUser => {
    //       if (currentUser) {
    //         this.loggedUser = currentUser;
    //         this.ownProfile = this.loadedUserId === this.loggedUser.id;
    //       } else {
    //         this.loggedUser = null;
    //         this.ownProfile = false;
    //       }
    //       if (!this.ownProfile) {
    //         this.userService.getUserById(this.loadedUserId).subscribe(user => {
    //           this.loadedUser = user;
    //           this.userIsLoading = false;
    //         }, error => {
    //           console.log("getUserError", error);
    //           this.showALert();
    //         });
    //       } else {
    //         this.loadedUser = {
    //           id: this.loggedUser.id,
    //           email: this.loggedUser.email,
    //           username: this.loggedUser.username,
    //           country: this.loggedUser.country,
    //           picture: this.loggedUser.picture,
    //           favouriteGames: this.loggedUser.favouriteGames
    //         };
    //         this.userIsLoading = false;
    //       }
    //     });
    //     this.gamesService.fetchOwnGames(this.loadedUserId).subscribe(games => {
    //       this.loadedOwnGames = games;
    //       this.gamesAreLoading = false;
    //     })
    //   });
    //   this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    //   // this.countryService.getAllCountries().subscribe(res => {
    //   //   for (var key in res) {
    //   //     this.countries.push(res[key].name);
    //   //   }
    //   // });
    // }

    ionViewWillEnter()
    {
      if (this.loadedUserId && this.firstTime) {
        console.log("ionViewWillEnter fetch data");
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

    editUsernameAlert()
    {
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

    editPictureAlert()
    {
      this.alertCtrl.create({
        header: "Upload your new picture",
        inputs: [{
          placeholder: "New picture",
          type: "text",
          name: "picture",
          value: this.loggedUser.picture
        }],
        buttons: [
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Save",
            handler: (event) => {
              this.updatePicture(event.picture);
            }
          }
        ]
      }).then(
        alertEl => alertEl.present()
      )
    }

    updateUsername(username
  :
    string
  )
    {
      console.log("update username", username);
      this.userService.updateUser(this.loggedUser.id, null, username, null, null, null, null).pipe(take(1)).subscribe(response => {
        console.log("response", response);
      })
    }

    updatePicture(picture
  :
    string
  )
    {
      console.log("update picture", picture);
      this.userService.updateUser(this.loggedUser.id, null, null, null, picture, null, null).pipe(take(1)).subscribe(response => {
        console.log("response", response);
      });
    }

    addToFavourites(gameId
  :
    string
  )
    {
      this.userService.updateUser(
        this.loggedUser.id,
        null,
        null,
        null,
        "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
        gameId,
        true
      ).pipe(take(1)).subscribe();
    }

    deleteFromFavourites(gameId
  :
    string
  )
    {
      this.userService.updateUser(
        this.loggedUser.id,
        null,
        null,
        null,
        "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
        gameId,
        false
      ).pipe(take(1)).subscribe();
    }

    checkIsItFavourite(id
  :
    string
  ):
    boolean
    {
      return this.loggedUser.favouriteGames.includes(id);
    }

    deleteProfile()
    {
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

    startDeleteTheProfile()
    {
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

    deleteGame(id
  :
    string
  )
    {
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
                console.log(res);
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

    createGame()
    {
      this.router.navigate(['/', 'games', 'create-game']);
    }

    editGame(id
  :
    string
  )
    {
      this.router.navigate(['/', 'games', 'edit-game', id]);
    }

    showALert()
    {
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

    countrySelectionChanged(country
  :
    string
  )
    {
      console.log("countrySelectionChanged", country);
      this.userService.updateUser(
        this.loggedUser.id,
        null,
        null,
        country,
        "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
        null,
        null
      ).pipe(take(1)).subscribe();
      this.modal.dismiss();
    }

    onFilterUpdate(event
  :
    CustomEvent<SegmentChangeEventDetail>
  )
    {
      this.listGames = (event.detail.value === 'games');
      console.log("change list", event.detail.value)
    }

    ngOnDestroy()
    {
      if (this.userSub) {
        this.userSub.unsubscribe();
      }
    }
  }

// capacitor.config.ts
//
// import { CapacitorConfig } from '@capacitor/cli';
//
// const config: CapacitorConfig = {
//   appId: 'io.ionic.starter',
//   appName: 'UniversitySport',
//   webDir: 'www',
//   bundledWebRuntime: false
// };
//
// export default config;

