import {Component, Input, OnInit} from '@angular/core';
import {LiveGame} from "../../../models/liveGame";
import {Player} from "../../../models/Player";
import {AlertController, ModalController} from "@ionic/angular";
import {LiveGameService} from "../../live-game.service";
import {take} from "rxjs/operators";
import {Game} from "../../../models/game.model";
import {GamesService} from "../../../games/games.service";
import {checkCustomElementSelectorForErrors} from "@angular/compiler-cli/src/ngtsc/annotations/component/src/diagnostics";

@Component({
  selector: 'app-checkpoints',
  templateUrl: './checkpoints.component.html',
  styleUrls: ['./checkpoints.component.scss'],
})
export class CheckpointsComponent implements OnInit {

  @Input() liveGameId: string;
  @Input() playerId: string;
  liveGame: LiveGame;
  game: Game;
  players: Player;
  actualCheckpoints: { done: boolean, indexx: number, name: string}[] = [];
  isLoading: boolean;

  constructor(private modalCtrl: ModalController,
              private alertController: AlertController,
              private liveGameService: LiveGameService,
              private gamesService: GamesService) { }

  ngOnInit() {
    this.isLoading = true;
    if (this.liveGameId && this.playerId) {
      this.liveGameService.fetchLiveGame(this.liveGameId).subscribe(liveGame => {
        this.liveGame = liveGame;
        this.gamesService.fetchGame(this.liveGame.gameId).pipe(take(1)).subscribe(game => {
          if (game) {
            this.game = game;
            this.liveGameService.fetchPlayer(this.playerId).pipe(take(1)).subscribe(player => {
              if (player) {
                console.log(player);
                player.checkpointsState.forEach(state => {
                  let check = this.game.checkpoints.find(check => check.index === state.checkIndex);
                  this.actualCheckpoints.push({ done: state.done, indexx: state.checkIndex, name: check.name });
                });
                this.actualCheckpoints = this.actualCheckpoints.sort((a, b) =>  a.indexx < b.indexx ? -1 : (a.indexx > b.indexx ? 1 : 0));
                this.isLoading = false;
              }
            })
          } else {
            this.showALert();
          }
        });
      }, error => {
        this.showALert();
      });
    } else {
      this.showALert();
    }
  }

  showALert() {
    this.alertController
      .create({
        header: 'An error occured',
        message: 'Checkpoints could not be fetched. Please try again later.',
        buttons: [{
          text: 'Okay', handler: () => {
            this.modalCtrl.dismiss();
          }
        }]
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }
}
