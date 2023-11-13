import {Component, OnDestroy, OnInit} from '@angular/core';
import {Game} from "../../models/game.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {GamesService} from "../games.service";
import {of, Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";
import {catchError, switchMap, take} from "rxjs/operators";
import {LocationType} from "../../enums/LocationType";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
})
export class GameDetailsPage implements OnInit, OnDestroy {

  game: Game;
  gameSub: Subscription;
  isLoading = false;
  user: User;
  creator: User;
  ownGame = false;
  LocationType = LocationType;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private gamesService: GamesService,
              private authService: AuthService,
              private userService: UserService,
              private alertController: AlertController,
              private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      }
      this.isLoading = true;
      this.gamesService.fetchGame(paramMap.get('gameId')).pipe(
        take(1),
        catchError(error => {
          this.showALert();
          return of(null);
        }),
        switchMap(game => {
          if (game) {
            this.game = game;
            this.isLoading = false;
            return this.userService.getUserById(game.userId).pipe(take(1));
          } else {
            return of(null);
          }
        }),
        catchError(error => {
          return of(null);
        }),
        switchMap(user => {
          if (user) {
            this.creator = user;
            return this.authService.user.pipe(take(1));
          } else {
            return of(null);
          }
        })
      ).subscribe(user => {
        this.isLoading = false;
        if (user) {
          this.user = user;
          this.ownGame = (this.user.id === this.creator.id);
        }
      });
    });
  }

  navigate() {
    this.router.navigate(['/', 'events', 'create-event'], {
      queryParams: { gameId: this.game.id }
    });
  }

  showALert() {
    this.alertController
      .create(
        {
          header: 'An error occured',
          message: 'Game could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/', 'games']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  deleteGame(id: string) {
    this.alertController.create({
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
              this.router.navigate(['/', 'games']);
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

  navigateToGameMode() {
    this.router.navigate(['/', 'game-mode'], { queryParams: { gameId: this.game.id }});
  }

  ngOnDestroy(): void {
    if (this.gameSub) {
      this.gameSub.unsubscribe();
    }
  }

}
