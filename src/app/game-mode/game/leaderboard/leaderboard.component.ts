import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PlayerModel} from "../../../models/player.model";
import {AlertController, ModalController} from "@ionic/angular";
import {LiveGameService} from "../../live-game.service";
import {LiveGame} from "../../../models/liveGame";
import {take} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {

  @Input() liveGameId: string;
  @Input() quiz: boolean;
  liveGame: LiveGame;
  players: { player: PlayerModel, score: number, doneNumber: number }[] = [];
  isLoading: boolean;

  constructor(private modalCtrl: ModalController,
              private alertController: AlertController,
              private liveGameService: LiveGameService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.isLoading = true;
    if (this.liveGameId) {
      this.liveGameService.fetchLiveGame(this.liveGameId).pipe(take(1)).subscribe(liveGame => {
        this.liveGame = liveGame;
        this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
          players.forEach(player => {
            if (player.liveGameId === this.liveGame.id) {
              let doneNumber = 0;
              player.checkpointsState.forEach(state => {
                if (state.done) doneNumber += 1;
              });
              this.players.push({ player: player, score: player.score, doneNumber: doneNumber });
            }
          });
          this.players = this.players.sort((a, b) =>  a.doneNumber < b.doneNumber ? 1 : (a.doneNumber > b.doneNumber ? -1 : 0));
          this.isLoading = false;
        })
      }, error => {
        this.showALert();
      });
    } else {
      this.showALert();
    }
  }

  sort(event) {
    if (event.detail.value === "Done") {
      this.players = this.players.sort((a, b) =>  a.doneNumber < b.doneNumber ? 1 : (a.doneNumber > b.doneNumber ? -1 : 0));
    } else {
      this.players = this.players.sort((a, b) =>  a.score < b.score ? 1 : (a.score > b.score ? -1 : 0));
    }
  }

  showALert() {
    this.alertController
      .create({
        header: this.translate.currentLang === "hu" ? "Hiba történt" : 'An error occured',
        message: this.translate.currentLang === "hu" ? "A ranglistát nem sikerült lekérni. Kérem próbálja meg még egyszer." :'Leaderboard could not be fetched. Please try again later.',
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
