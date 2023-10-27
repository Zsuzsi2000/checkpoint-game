import {Component, OnDestroy, OnInit} from '@angular/core';
import {Game} from "../../models/game.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {GamesService} from "../games.service";
import {Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";
import {take} from "rxjs/operators";

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

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private gamesService: GamesService,
              private authService: AuthService,
              private alertController: AlertController,
              private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      }
      this.isLoading = true;
      this.gamesService.fetchGame(paramMap.get('gameId')).subscribe(game => {
        this.game = game;
        this.isLoading = false;
      }, error => {
        this.showALert();
      })
    }, error => {
      this.showALert();
    });
    this.authService.user.pipe(take(1)).subscribe(user => {
      this.user = user;
    })
  }

  ngOnDestroy(): void {
    if (this.gameSub) {
      this.gameSub.unsubscribe();
    }
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

}
