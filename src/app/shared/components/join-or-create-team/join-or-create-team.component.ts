import {Component, Input, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from "@ionic/angular";
import {Event} from "../../../models/event.model"
import {User} from "../../../models/user.model";
import {LiveGame} from "../../../models/liveGame";
import {Player} from "../../../models/Player";
import {LiveGameService} from "../../../game-mode/live-game.service";
import {switchMap, take, takeWhile} from "rxjs/operators";
import {AuthResponseData} from "../../../auth/auth.service";
import {interval} from "rxjs";
import {CheckpointState} from "../../../interfaces/CheckpointState";
import {GamesService} from "../../../games/games.service";
import {Game} from "../../../models/game.model";

@Component({
  selector: 'app-join-or-create-team',
  templateUrl: './join-or-create-team.component.html',
  styleUrls: ['./join-or-create-team.component.scss'],
})
export class JoinOrCreateTeamComponent implements OnInit {

  @Input() event: Event;
  @Input() liveGame: LiveGame;
  @Input() user: User;
  @Input() game: Game;
  @Input() gameMode: boolean = false;
  players: Player[] = [];
  player: Player;
  join: boolean;
  chosenTeam = "";
  canJoinToATeam: boolean;
  canCreateATeam: boolean;

  constructor(private modalCtrl: ModalController,
              private liveGameService: LiveGameService,
              private loadingController: LoadingController,
              private alertCtrl: AlertController,
              private navCtrl: NavController) { }

  ngOnInit() {
    if (this.event) {
      this.setFirstThingsByEvent();
    } else if (this.liveGame) {
      this.setFirstThingsByLiveGame();
    }
  }

  setFirstThingsByEvent() {
    this.canJoinToATeam = false;
    this.canCreateATeam = false;
    this.join = false;
    if (this.event.joined) {
      this.chosenTeam = this.event.joined.length > 0 ? this.event.joined[0].teamName : "";
      if (this.event.joined.length < this.event.liveGameSettings.maxTeam) {
        this.canCreateATeam = true;
        this.join = false;
      }
      this.event.joined.forEach(team => {
        if (team.teamMembers.length < this.event.liveGameSettings.maxTeamMember) {
          this.canJoinToATeam = true;
          this.join = true;
        }
      })
    } else {
      this.event.joined = [];
      this.canCreateATeam = true;
      this.canJoinToATeam = true;
      this.join = true;
    }
  }

  setFirstThingsByLiveGame() {
    this.canJoinToATeam = false;
    this.canCreateATeam = false;
    this.join = false;
    this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
      if (players) {
        this.players = players.filter((player: Player) => player.liveGameId === this.liveGame.id);
        if (this.players.length > 0) {
          this.chosenTeam = this.players[0].teamName;
          if (this.players.length < this.liveGame.liveGameSettings.maxTeam) {
            this.canCreateATeam = true;
            this.join = false;
          }
          this.players.forEach(team => {
            if (team.teamMembers.length < this.liveGame.liveGameSettings.maxTeamMember) {
              this.canJoinToATeam = true;
              this.join = true;
            }
          })
        } else {
          this.players = [];
          this.canCreateATeam = true;
          this.canJoinToATeam = true;
          this.join = true;
        }
      }
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  setJoin(event) {
    this.join = event.detail.value === "true";
    this.chosenTeam = "";
  }

  setTeam(team: string) {
    this.chosenTeam = team;
  }

  submit() {
    if (this.join) {
      if (this.event) {
        this.joinEventTeam();
      } else if (this.liveGame) {
        this.joinGameLiveGamePlayer();
      }
    } else {
      if (this.event) {
        this.createEventTeam();
      } else if (this.liveGame) {
        this.createGameLiveGamePlayer();
      }
    }
  }

  joinEventTeam() {
    this.event.joined = this.event.joined.map(team => {
      if (team.teamName === this.chosenTeam) {
        if (team.teamMembers) {
          team.teamMembers.push({id: this.user.id, name: this.user.username});
        } else {
          team.teamMembers = [{id: this.user.id, name: this.user.username }];
        }
      }
      return team;
    });
    this.modalCtrl.dismiss(this.event);
  }

  createEventTeam() {
    this.event.joined
      ? this.event.joined.push({ teamName: this.chosenTeam, teamMembers: [{id: this.user.id, name: this.user.username }] })
      : [{ teamName: this.chosenTeam, teamMembers: [{id: this.user.id, name: this.user.username }] }];

    this.modalCtrl.dismiss(this.event);
  }

  joinGameLiveGamePlayer() {
    this.players.forEach(player => {
      if (player.teamName === this.chosenTeam) {
        if (player.teamMembers) {
          player.teamMembers.push({id: this.user.id, name: this.user.username});
        } else {
          player.teamMembers = [{id: this.user.id, name: this.user.username }];
        }
        this.updatePlayer(player);
      }
    })
  }

  createGameLiveGamePlayer() {
    let teamName = this.chosenTeam;
    let teamMembers = [{id: this.user.id, name: this.user.username }];
    this.createPlayer(teamName, teamMembers);
  }

  updatePlayer(player: Player) {
    this.loadingController.create({ keyboardClose: true, message: 'Update team...',  }).then(loadingEl => {
      loadingEl.present();
      this.liveGameService.updatePlayer(player).pipe(take(1)).subscribe(updatedPlayer => {
        if (updatedPlayer) {
          this.player = player;
          loadingEl.dismiss();
          this.modalCtrl.dismiss(this.player);
        }
      }, error => {
        this.showAlert('Failed', 'Something went wrong');
      });

    });
  }

  createPlayer(teamName: string, teamMembers: {id: string, name: string}[]) {
    let checkpointStates: CheckpointState[] = [];
    let player: Player;
    for (let i = 0; i < this.game.checkpoints.length; i++) {
      let checkpointState: CheckpointState = {
        checkIndex: i,
        find: false,
        done: false,
        correctAnswer: null,
        useHelp: null,
        startTimestap: null,
        endTimestap: null
      };
      checkpointStates.push(checkpointState);
    }
    player = new Player(null, this.liveGame.id, teamName, teamMembers, checkpointStates);

    this.loadingController.create({ keyboardClose: true, message: 'Create team...',  }).then(loadingEl => {
      loadingEl.present();
      this.liveGameService.createPlayer(player).pipe(take(1)).subscribe(createdPlayer => {
        if (createdPlayer) {
          this.player = player;
          loadingEl.dismiss();
          this.modalCtrl.dismiss(this.player);
        }
      }, error => {
        this.showAlert('Failed', 'Something went wrong');
      });
    });
  }

  showAlert(header: string, message: string ) {
    this.alertCtrl
      .create(
        {
          header: header,
          message: message,
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

}
