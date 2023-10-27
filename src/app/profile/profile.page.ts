import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {GamesService} from "../games/games.service";
import {UserService} from "../services/user.service";
import {AlertController, NavController} from "@ionic/angular";
import {take} from "rxjs/operators";
import {BehaviorSubject, Subscription} from "rxjs";
import {Game} from "../models/game.model";
import {User} from "../models/user.model";
import {ActivatedRoute} from "@angular/router";
import {UserData} from "../interfaces/UserData";
import { SegmentChangeEventDetail } from '@ionic/core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  loadedUserSubject = new BehaviorSubject<User | null>(null);

  isLoading = false;
  loadedOwnGames: Game[];
  loadedUser: UserData;
  loggedUser: User;
  ownProfile: boolean;
  listGames = true;

  alertButtons = ['OK'];
  public alertInputs = [
    {
      placeholder: 'Username',
    }
  ];

  constructor(private gamesService: GamesService,
              private userService: UserService,
              private authService: AuthService,
              private alertCtrl: AlertController,
              private activatedRoute: ActivatedRoute,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('userId')) {
        this.navCtrl.pop();
      }

      this.isLoading = true;
      this.userService.getUserById(paramMap.get('userId')).subscribe(
        (user) => {
          this.loadedUser = user;
          // this.loadedUserSubject.next(user);
          this.authService.user.pipe(take(1)).subscribe((user) => {
            this.loggedUser = user;
            this.ownProfile = user.id === this.loadedUser.id;
            console.log("ugyanaz-e", this.ownProfile);
            this.gamesService.fetchOwnGames(this.loadedUser.id).subscribe((games) => {
              this.loadedOwnGames = games;
              console.log('fetchOwnGames');
              this.isLoading = false;
            });
          });
        },
        (error) => {
          this.showALert();
        }
      );
    });


    // this.activatedRoute.paramMap.subscribe(paramMap => {
    //   if (!paramMap.has('userId')) {
    //     this.navCtrl.pop();
    //   }
    //   this.isLoading = true;
    //   this.userService.getUserById(paramMap.get('userId')).subscribe(user => {
    //     this.loadedUser = user;
    //     this.isLoading = false;
    //     this.authService.user.pipe(take(1)).subscribe(user => {
    //       this.loggedUser = user;
    //       this.ownProfile = this.loadedUser.id === this.loggedUser.id;
    //       this.isLoading = false;
    //     })
    //   }, error => {
    //     this.showALert();
    //   })
    // }, error => {
    //   this.showALert();
    // });
  }

  // ionViewWillEnter() {
  // }

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

  editEmailAlert() {
    this.alertCtrl.create({
      header: "Enter your new email",
      inputs: [{
        placeholder: "New email address",
        type: "email",
        name: "email",
        value: this.loggedUser.email
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Save",
          handler: (event) => {
            this.updateEmail(event.email);
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    )
  }

  updateUsername(username: string) {
    console.log("update username", username);
    this.userService.updateUser(this.loggedUser.id, username, null, null, null, null).
    pipe(take(1)).subscribe(response => {
      console.log("response", response);
    })
  }

  updateEmail(email: string) {
    console.log("update email", email);
    this.authService.updateEmailProcess(email).subscribe(response => {
      console.log("response", response);
    });
  }

  addToFavourites(gameId: string) {
    this.userService.updateUser(
      this.loggedUser.id,
      null,
      null,
      "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
      gameId,
      true
    ).pipe(take(1)).subscribe();
  }

  deleteFromFavourites(gameId: string) {
    this.userService.updateUser(
      this.loggedUser.id,
      null,
      null,
      "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
      gameId,
      false
    ).pipe(take(1)).subscribe();
  }

  checkIsItFavourite(id: string): boolean {
    return this.loggedUser.favouriteGames.includes(id);
  }

  deleteProfile() {
    this.authService.deleteAccount().subscribe(
      resData => {
        console.log("deleteAccount1",resData);
      },
      errRes => {
        console.log("error", errRes.error.error.message);
      });
    this.userService.deleteUser(this.loadedUser.id).subscribe(resData => {
        console.log("deleteAccount2",resData);
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
            text: "Verify",
            role: "verify",
            handler: () => {
              this.deleteProfile();
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  showALert() {
    this.alertCtrl
      .create(
        {
          header: 'An error occured',
          message: 'Game could not be fetched. Please try again later.',
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

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.listGames = (event.detail.value === 'games');
    console.log("change list", event.detail.value)

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

