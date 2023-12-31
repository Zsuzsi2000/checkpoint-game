import {Component, Input, OnInit} from '@angular/core';
import {LiveGame} from "../../../models/liveGame";
import {PlayerModel} from "../../../models/player.model";
import {AlertController, ModalController} from "@ionic/angular";
import {LiveGameService} from "../../live-game.service";
import {take} from "rxjs/operators";
import {Game} from "../../../models/game.model";
import {GamesService} from "../../../games/games.service";
import {TranslateService} from "@ngx-translate/core";

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
  players: PlayerModel;
  actualCheckpoints: { done: boolean, indexx: number, name: string}[] = [];
  isLoading: boolean;

  constructor(private modalCtrl: ModalController,
              private alertController: AlertController,
              private liveGameService: LiveGameService,
              private gamesService: GamesService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.isLoading = true;
    if (this.liveGameId && this.playerId) {
      this.liveGameService.fetchLiveGame(this.liveGameId).pipe(take(1)).subscribe(liveGame => {
        this.liveGame = liveGame;
        this.gamesService.fetchGame(this.liveGame.gameId).pipe(take(1)).subscribe(game => {
          if (game) {
            this.game = game;
            this.liveGameService.fetchPlayer(this.playerId).pipe(take(1)).subscribe(player => {
              if (player) {
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
        header: this.translate.currentLang === "hu" ? "Hiba történt" : 'An error occured',
        message: this.translate.currentLang === "hu" ? "A checkpointokat nem sikerült lekérni. Kérem próbálja meg még egyszer." : 'Checkpoints could not be fetched. Please try again later.',
        buttons: [{
          text: (this.translate.currentLang === "hu" ? "Rendben" : 'Okay'), handler: () => {
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
