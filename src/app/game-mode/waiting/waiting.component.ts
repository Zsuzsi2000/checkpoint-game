import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LiveGame} from "../../models/liveGame";
import {PlayerModel} from "../../models/player.model";
import {Event} from "../../models/event.model";
import {interval, Subscription} from "rxjs";
import {switchMap, take} from "rxjs/operators";
import {LiveGameService} from "../live-game.service";
import {Router} from "@angular/router";
import {LoadingController, ModalController} from "@ionic/angular";
import {ShareComponent} from "../../shared/components/share/share.component";
import {User} from "../../models/user.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
})
export class WaitingComponent implements OnInit {

  @Input() liveGame: LiveGame;
  @Input() creator: boolean;
  @Input() creatorObject: User;
  @Input() event: Event;
  players: PlayerModel[] = [];
  playersSub: Subscription;
  startSub: Subscription;
  alreadyJoined = 0;

  constructor(private liveGameService: LiveGameService,
              private router: Router,
              private loadingController: LoadingController,
              private modalCtrl: ModalController,
              private translate: TranslateService) { }

  ngOnInit() {
    this.playersSub = interval(3000).pipe(
      switchMap(() => {
        return this.liveGameService.fetchPlayers().pipe(take(1));
      })
    ).subscribe((players => {
      if (players) {
        this.players = (players as PlayerModel[]).filter(player => player.liveGameId === this.liveGame.id);
        this.alreadyJoined = 0;
        this.players.forEach(player => {
          player.teamMembers.forEach(member => {
            this.alreadyJoined += 1;
          })
        })
      }
    }));
    this.startSub = interval(3000).pipe(
      switchMap(() => {
        return this.liveGameService.fetchLiveGame(this.liveGame.id).pipe(take(1));
      })
    ).subscribe((liveGame => {
      if (liveGame && liveGame.startDate !== null) {
        this.router.navigate(['/', 'game-mode', 'game', this.liveGame.id]);
      }
    }));
  }

  startTheGame() {
    if (this.creator) {
      this.loadingController.create({ keyboardClose: true, message: this.translate.currentLang === "hu" ? "Esemény indítása..." : 'Start event...',  }).then(loadingEl => {
        loadingEl.present();
        this.liveGame.startDate = new Date();
        this.liveGameService.updateLiveGame(this.liveGame).pipe(take(1)).subscribe(updatedLiveGame => {
          if (updatedLiveGame) {
            loadingEl.dismiss();
            this.router.navigate(['/', 'game-mode', 'game', this.liveGame.id]);
          }
        }, error => {});
      });
    }
  }

  teamIsReady(player: PlayerModel) {
    let team = this.event.joined.find(p=> p.teamName === player.teamName);
    return team.teamMembers.length === player.teamMembers.length;
  }

  ionViewDidLeave() {
    if (this.playersSub) this.playersSub.unsubscribe();
    if (this.startSub) this.startSub.unsubscribe();
  }

  shareAccessCode() {
    this.modalCtrl.create({ component: ShareComponent, componentProps: { user: this.creatorObject, accessCode: this.liveGame.accessCode } }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {});
      modalEl.present();
    });
  }

}
