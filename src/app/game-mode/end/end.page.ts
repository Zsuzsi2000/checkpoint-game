import {Component, OnInit} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from "@angular/router";
import {LiveGameService} from "../live-game.service";
import {AlertController, NavController} from "@ionic/angular";
import {PlayerModel} from "../../models/player.model";
import {switchMap, take} from "rxjs/operators";
import {GamesService} from "../../games/games.service";
import {Game} from "../../models/game.model";
import {AuthService} from "../../auth/auth.service";
import {forkJoin, interval, of, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-end',
  templateUrl: './end.page.html',
  styleUrls: ['./end.page.scss'],
})
export class EndPage implements OnInit {

  liveGameId: string;
  playerId: string;
  isLoading = true;
  game: Game;
  players: PlayerModel[] = [];
  playersSub: Subscription;
  player: PlayerModel;
  userName: string;
  sortType = "Score";
  helps = 0;
  first = false;

  constructor(private activatedRoute: ActivatedRoute,
              private liveGameService: LiveGameService,
              private navCtrl: NavController,
              private router: Router,
              private gameService: GamesService,
              private alertController: AlertController,
              private authService: AuthService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('liveGame')) {
        this.navCtrl.pop();
        return;
      }
      this.liveGameId = paramMap.get('liveGame');
      if (this.activatedRoute.snapshot.queryParamMap.has('playerId')) {
        this.playerId = this.activatedRoute.snapshot.queryParamMap.get('playerId');
      }
      this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
        this.players = (players as PlayerModel[]).filter(p => p.liveGameId === this.liveGameId);
        this.player = (players as PlayerModel[]).find(p => p.id === this.playerId);
        this.player.checkpointsState.forEach(check => {
          if (check.useHelp) this.helps += 1;
        });
        if (!this.first) {
          this.updateGame();
        }
      });

      this.liveGameService.fetchLiveGame(this.liveGameId).pipe(take(1)).subscribe(liveGame => {
        if (liveGame) {
          this.gameService.fetchGame(liveGame.gameId).pipe(take(1)).subscribe(game => {
            if (game) {
              this.game = game;
              this.sortType = this.game.quiz ?  "Score" : "BigDuration";

              this.authService.user.pipe(take(1)).subscribe(user => {
                if (user) {
                  this.userName = user.username;
                }
                if (!this.first) {
                  this.updateGame();
                }
              })
            }
          })
        }
      });

      this.playersSub = interval(5000).pipe(
        switchMap(() => {
          return this.liveGameService.fetchPlayers().pipe(take(1));
        })
      ).subscribe(players => {
        this.players = (players as PlayerModel[]).filter(p => p.liveGameId === this.liveGameId);
        if (this.sortType === "Score") {
          this.players = this.players.sort((a, b) => a.score < b.score ? 1 : (a.score > b.score ? -1 : 0));
        } else if (this.sortType === "BigDuration") {
          this.players = this.players.sort((a, b) => a.duration < b.duration ? -1 : (a.duration > b.duration ? 1 : 0));
        } else {
          this.players = this.players.sort((a, b) => a.checkpointsDuration < b.checkpointsDuration ? -1 : (a.checkpointsDuration > b.checkpointsDuration ? 1 : 0));
        }
      })
    });
  }

  updateGame() {
    forkJoin([of(this.player), of(this.game)]).pipe(take(1)).subscribe(([player, game]) => {
      this.isLoading = false;
      if (game && player) {
        this.first = true;

        if (this.game.bests) {
          if (this.game.bests.score < this.player.score && this.game.quiz) {
            this.game.bests.score = this.player.score;
            this.congratulations(this.translate.currentLang === 'hu' ? 'pont' : 'score');
          }
          if (this.game.bests.duration > this.player.duration) {
            this.game.bests.duration = this.player.duration;
            this.congratulations(this.translate.currentLang === 'hu' ? 'idő' : 'duration');
          }
          if (this.game.bests.checkpointDuration > this.player.checkpointsDuration && this.game.quiz) {
            this.game.bests.checkpointDuration = this.player.checkpointsDuration;
            this.congratulations(this.translate.currentLang === 'hu' ? 'válaszadás idő' : 'duration of response');
          }
        } else {
          this.game.bests = {
            score: this.player.score ? this.player.score : null,
            duration: this.player.duration ? this.player.duration : null,
            checkpointDuration: this.player.checkpointsDuration ? this.player.checkpointsDuration : null,
          };
        }

        this.gameService.updateGame(this.game.id, this.game.name, this.game.locationType, this.game.locationIdentification,
          this.game.country, this.game.pointOfDeparture, this.game.category, this.game.quiz, this.game.description,
          this.game.imgUrl, this.game.distance, this.game.duration, this.game.itIsPublic, this.game.mapUrl,
          this.game.checkpoints, this.game.numberOfAttempts + 1, this.game.creationDate, this.game.ratings, this.game.bests).pipe(take(1)).subscribe();
      }
    });
  }

  congratulations(type: string) {
    let message = (this.translate.currentLang === "hu")
      ? "Új " + type + " rekordot értél el!"
      : "You set a new " + type + " record!";

    this.alertController.create({
      header: this.translate.currentLang === "hu" ? "Gratulálunk!" : "Congratulations!",
      message: message,
      buttons: [this.translate.currentLang === "hu" ? "Köszönöm" : "Thanks"]
    }).then(
      alertEl => alertEl.present()
    );
  }

  sort(event) {
    this.sortType = event.detail.value;
    if (event.detail.value === "Score") {
      this.players = this.players.sort((a, b) => a.score < b.score ? 1 : (a.score > b.score ? -1 : 0));
    } else if (event.detail.value === "BigDuration") {
      this.players = this.players.sort((a, b) => a.duration < b.duration ? -1 : (a.duration > b.duration ? 1 : 0));
    } else {
      this.players = this.players.sort((a, b) => a.checkpointsDuration < b.checkpointsDuration ? -1 : (a.checkpointsDuration > b.checkpointsDuration ? 1 : 0));
    }
  }

  backToMenu() {
    this.players.forEach(player => {
      this.liveGameService.deletePlayer(player.id).subscribe();
    });

    this.liveGameService.deleteLiveGame(this.liveGameId).subscribe(d => {
      this.router.navigate(['/', 'games']);
    });

  }

  addRating() {
    this.alertController.create({
      header: this.translate.currentLang === "hu" ? "Adj egy értékelést vagy írd le a véleményed" : "Give a rating or write your opinion",
      inputs: [{
        placeholder: this.translate.currentLang === "hu" ? "Értékelés" : "Rating",
        type: "text",
        name: "rating",
      }],
      buttons: [
        {
          text: this.translate.currentLang === "hu" ? "Vissza" : "Cancel",
          role: "cancel"
        },
        {
          text: this.translate.currentLang === "hu" ? "Mehet" : "Go",
          handler: (event) => {
            if (this.game.ratings) {
              this.game.ratings.push({username: this.userName, text: event.rating});
            } else {
              this.game.ratings = [{username: this.userName, text: event.rating}];
            }

            this.gameService.updateGame(this.game.id, this.game.name, this.game.locationType, this.game.locationIdentification,
              this.game.country, this.game.pointOfDeparture, this.game.category, this.game.quiz, this.game.description,
              this.game.imgUrl, this.game.distance, this.game.duration, this.game.itIsPublic, this.game.mapUrl,
              this.game.checkpoints, this.game.numberOfAttempts, this.game.creationDate, this.game.ratings).pipe(take(1)).subscribe();
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  transform(duration: number): string {
    const hours = Math.floor(duration / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((duration % (60 * 1000)) / 1000);

    const formattedHours = this.padZero(hours);
    const formattedMinutes = this.padZero(minutes);
    const formattedSeconds = this.padZero(seconds);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  getHelp(player: PlayerModel) {
    return player.checkpointsState.filter(check => check.useHelp).length;
  }

  checkDone(player: PlayerModel) {
    let state = player.checkpointsState.find(p=> p.done === false);
    return state === undefined;
  }

  ngOnDestroy(): void {
    // this.players.forEach(player => {
    //   this.liveGameService.deletePlayer(player.id).subscribe(d => {
    //     console.log(d);
    //   });
    // });
    //
    // this.liveGameService.deleteLiveGame(this.liveGameId).subscribe(d => {
    //   console.log(d);
    // });
  }

  ionViewDidLeave() {
    if (this.playersSub) this.playersSub.unsubscribe();
  }

}
