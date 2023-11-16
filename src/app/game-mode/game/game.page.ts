import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {LiveGameService} from "../live-game.service";
import {Player} from "../../models/Player";
import {LiveGame} from "../../models/liveGame";
import {forkJoin, of, Subscription} from "rxjs";
import {GameMode} from "../../enums/GameMode";
import {LeaderboardComponent} from "./leaderboard/leaderboard.component";
import {CheckpointsComponent} from "./checkpoints/checkpoints.component";
import {GamesService} from "../../games/games.service";
import {AuthService} from "../../auth/auth.service";
import {take} from "rxjs/operators";
import {User} from "../../models/user.model";
import {Game} from "../../models/game.model";
import {Checkpoint} from "../../models/checkpoint.model";
import {LocationType} from "../../enums/LocationType";

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {

  isLoading: boolean = true;
  liveGame: LiveGame;
  user: User;
  game: Game;
  player: Player;
  players: Player[] = [];
  actualCheckpoint: Checkpoint;
  playersSub: Subscription;
  LocationType = LocationType;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private liveGameService: LiveGameService,
              private gamesService: GamesService,
              private authService: AuthService,
              private alertController: AlertController,
              private modalController: ModalController,
              private router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => this.handleParamMap(paramMap));
  }

  handleParamMap(paramMap: any): void {
    if (!paramMap.has('liveGame')) {
      this.navCtrl.pop();
      return;
    }

    this.liveGameService.fetchLiveGame(paramMap.get('liveGame')).subscribe(
      liveGame => {
        this.liveGame = liveGame;
        this.handlePlayersAndUser();
        this.handleGameFetch();
      },
      error => this.showALert()
    );
  }

  handlePlayersAndUser(): void {
    this.playersSub = this.liveGameService.players.subscribe(players => {
      this.players = players.filter(player => player.liveGameId === this.liveGame.id);
      console.log(this.players);
      this.authService.user.pipe(take(1)).subscribe(user => {
        if (user) {
          this.user = user;
          this.player = this.players.find(player =>
            player.teamMembers.some(member => member.id === (this.user.id))
          );
          this.setActualCheckpointFirst();
        } else {
          this.player = this.players.find(player => player.teamName === "Guest");
          this.setActualCheckpointFirst();
        }
      });
    });
  }

  handleGameFetch(): void {
    this.gamesService.fetchGame(this.liveGame.gameId).subscribe(game => {
      if (game) {
        this.game = game;
        this.setActualCheckpointFirst();
      }
    });
  }

  setActualCheckpointFirst() {
    forkJoin([of(this.player), of(this.game)]).subscribe(([player, game]) => {
      console.log('Performing additional action with player and game:', player, game);
      if (game && player) {
        console.log('Performing additional action with player and game:', player, game);
        this.setActualCheckpoint();
      }
    });
  }

  setActualCheckpoint() {
    let state = this.player.checkpointsState.find(state => state.done === false);
    if (state) {
      this.actualCheckpoint = this.game.checkpoints.find(check => check.index === state.checkIndex);
    } else {
      //TODO: game over
    }
    this.isLoading = false;
  }

  showALert() {
    this.alertController
      .create({
        header: 'An error occured',
        message: 'Game could not be fetched. Please try again later.',
        buttons: [{
          text: 'Okay', handler: () => {
            this.router.navigate(['/', 'game-mode']);
          }
        }]
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

  identifyLocation() {
    switch (this.game.locationType) {
      case LocationType.location: {
        //TODO: Location check
        break;
      }
      case LocationType.description: {
        //TODO: qr or access code check
        break;
      }
      case LocationType.anywhere: {
        //TODO: show info or quiz
        break;
      }
    }
  }

  showLeaderboard() {
    this.modalController.create({
      component: LeaderboardComponent,
      componentProps: { liveGameId: this.liveGame.id }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
      });
      modalEl.present();
    });
  }

  showCheckpoints() {
    this.modalController.create({
      component: CheckpointsComponent,
      componentProps: { liveGameId: this.liveGame.id, playerId: this.player.id }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
      });
      modalEl.present();
    });
  }

  ngOnDestroy(): void {
    //TODO: nem feltétlen kell itt törölni
    // if (this.liveGame.liveGameSettings.gameMode === GameMode.solo) {
    //   this.players.forEach(player => {
    //     this.liveGameService.deletePlayer(player.id).subscribe(d => {
    //       console.log(d);
    //     });
    //   })
    // }
    // if (this.liveGame) {
    //   this.liveGameService.deleteLiveGame(this.liveGame.id).subscribe(d => {
    //     console.log(d);
    //   });
    // }
    if (this.playersSub) {
      this.playersSub.unsubscribe();
    }
  }

}
