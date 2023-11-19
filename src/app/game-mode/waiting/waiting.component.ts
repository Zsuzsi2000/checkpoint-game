import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LiveGame} from "../../models/liveGame";
import {Player} from "../../models/Player";
import {Event} from "../../models/event.model";
import {interval, Subscription} from "rxjs";
import {switchMap, take} from "rxjs/operators";
import {LiveGameService} from "../live-game.service";
import {Router} from "@angular/router";
import {LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
})
export class WaitingComponent implements OnInit {

  @Input() liveGame: LiveGame;
  @Input() creator: boolean;
  @Input() event: Event;
  players: Player[] = [];
  playersSub: Subscription;
  startSub: Subscription;
  alreadyJoined = 0;

  constructor(private liveGameService: LiveGameService,
              private router: Router,
              private loadingController: LoadingController) { }

  ngOnInit() {
    this.playersSub = interval(3000).pipe(
      switchMap(() => {
        return this.liveGameService.fetchPlayers().pipe(take(1));
      })
    ).subscribe((players => {
      if (players) {
        this.players = (players as Player[]).filter(player => player.liveGameId === this.liveGame.id);
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
      this.loadingController.create({ keyboardClose: true, message: 'Start event...',  }).then(loadingEl => {
        loadingEl.present();
        this.liveGame.startDate = new Date();
        this.liveGameService.updateLiveGame(this.liveGame).pipe(take(1)).subscribe(updatedLiveGame => {
          if (updatedLiveGame) {
            console.log(updatedLiveGame);
            loadingEl.dismiss();
            this.router.navigate(['/', 'game-mode', 'game', this.liveGame.id]);
          }
        }, error => {
          console.log(error);
        });

      });
    }
  }

  teamIsReady(player: Player) {
    let team = this.event.joined.find(p=> p.teamName === player.teamName);
    return team.teamMembers.length === player.teamMembers.length;
  }

  ionViewDidLeave() {
    if (this.playersSub) this.playersSub.unsubscribe();
    if (this.startSub) this.startSub.unsubscribe();
  }

}
