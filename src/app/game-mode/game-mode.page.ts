import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Game} from "../models/game.model";
import {Event} from "../models/event.model";
import {EventsService} from "../events/events.service";
import {GamesService} from "../games/games.service";
import {GameMode} from "../enums/GameMode";
import {AuthService} from "../auth/auth.service";
import {of, Subscription} from "rxjs";
import {User} from "../models/user.model";
import {LiveGameSettings} from "../models/liveGameSettings";
import {LiveGame} from "../models/liveGame";
import {CheckpointState} from "../interfaces/CheckpointState";
import {LiveGameService} from "./live-game.service";
import {Player} from "../models/Player";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {JoinOrCreateTeamComponent} from "../shared/components/join-or-create-team/join-or-create-team.component";
import {catchError, switchMap, take} from "rxjs/operators";

@Component({
  selector: 'app-game-mode',
  templateUrl: './game-mode.page.html',
  styleUrls: ['./game-mode.page.scss'],
})
export class GameModePage implements OnInit, OnDestroy {

  game: Game;
  event: Event;
  player: Player;
  user: User = null;
  getGame = false;
  getEvent = false;
  userSub: Subscription;
  liveGame: LiveGame;
  liveGameSettings: LiveGameSettings = new LiveGameSettings();
  GameMode = GameMode;
  creatingLiveGameSetting = false;

  constructor(private activatedRoute: ActivatedRoute,
              private gamesService: GamesService,
              private eventsService: EventsService,
              private authService: AuthService,
              private liveGameService: LiveGameService,
              private router: Router,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private navCtrl: NavController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) this.user = user;
    });
    if (this.activatedRoute.snapshot.queryParamMap.has('gameId')) {
      console.log(this.activatedRoute.snapshot.queryParamMap.get('gameId'));
      this.gamesService.fetchGame(this.activatedRoute.snapshot.queryParamMap.get('gameId')).subscribe(game => {
        console.log(game);
        this.game = game;
        this.getGame = true;
      });
    }
    if (this.activatedRoute.snapshot.queryParamMap.has('eventId')) {
      console.log(this.activatedRoute.snapshot.queryParamMap.get('eventId'));
      this.eventsService.fetchEvent(this.activatedRoute.snapshot.queryParamMap.get('eventId')).subscribe(event => {
        if (event) {
          this.event = event;
          this.liveGameSettings = this.event.liveGameSettings;
          this.getEvent = true;
          this.gamesService.fetchGame(event.gameId).subscribe(game => {
            this.game = game;
            this.getGame = true;
            if (this.liveGameSettings.gameMode === GameMode.notSpecified) {
              this.creatingLiveGameSetting = true;
            } else {
              this.createLiveGame().subscribe(id => {
                if (id) {
                  this.liveGame.id = id;
                  console.log(this.liveGame);
                  this.event.joined.forEach(team => {
                    this.createPlayer(team.teamName, team.teamMembers).subscribe(id => {
                      if (id) {
                        this.player.id = id;
                      }
                    })
                  });
                }


              })
            }
          });
        }
      });
    }
  }

  setSolo() {
    this.liveGameSettings = new LiveGameSettings(GameMode.solo, 1, 1);
    this.createLiveGame().subscribe(id => {
      if (id) {
        this.liveGame.id = id;
        console.log(this.liveGame);
        let createPlayer = (this.user)
          ? this.createPlayer(this.user.username,[{ id: this.user.id, name: this.user.username }])
          : this.createPlayer("Guest",[{ id: null, name: "Guest" }]);
        createPlayer.subscribe(id => {
          if (id) {
            this.player.id = id;
            this.router.navigate(['/', 'game-mode', 'game', this.liveGame.id]);
          }
        })

      }
    });
  }

  createMultiplayer() {
    this.creatingLiveGameSetting = true;
  }

  enterAccessCode() {
    this.alertCtrl.create({
      header: "Enter the access code",
      inputs: [{
        placeholder: "Access code",
        type: "text",
        name: "accessCode",
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Go",
          handler: (event) => {
            console.log(event.accessCode);
            this.liveGameService.fetchLiveGames().subscribe(liveGames => {
              if (liveGames) {
                liveGames.forEach((liveGame: LiveGame) => {
                  if (liveGame.accessCode === event.accessCode) this.liveGame = liveGame;
                })
              }
              if (this.liveGame) {
                console.log(this.liveGame);
                // event => joined fix
                // event => just players
                // simple game
                this.join();
              }
            })
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  join() {
    if (this.liveGame.event) {
      this.eventsService.fetchEvent(this.liveGame.eventId).subscribe(event => {
        if (event) {
          this.event = event;
          let signedUp = this.event.players.includes(this.user.id);
          if (!signedUp) {
            this.showALert("You haven't joined this event");
          } else {
            if (this.event.liveGameSettings.gameMode === GameMode.notSpecified) {
              this.joinMulti();
            } else {
              this.router.navigate(['/', 'game-mode', 'game', this.liveGame.id]);
            }
          }
        }
      })
    }
  }

  joinGame() {}

  joinMulti() {
    // switch (this.liveGame.liveGameSettings.gameMode) {
    //   case GameMode.notSpecified: {
    //     this.setJoinOrCancel(event, true);
    //     break;
    //   }
    //   case GameMode.teamVsTeam: {
    //     this.modalCtrl.create({
    //       component: JoinOrCreateTeamComponent,
    //       componentProps: { event: event, user: this.user }
    //     }).then(modalEl => {
    //       modalEl.onDidDismiss().then(modalData => {
    //         console.log(modalData.data);
    //         if (modalData.data) this.setJoinOrCancel(modalData.data, true);
    //       });
    //       modalEl.present();
    //     });
    //     break;
    //   }
    //   case GameMode.againstEachOther: {
    //     if (event.joined) {
    //       event.joined.push({ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] });
    //     } else {
    //       event.joined = [{ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
    //     }
    //     this.setJoinOrCancel(event, true);
    //     break;
    //   }
    //   case GameMode.teamGame: {
    //     if (event.joined && event.joined[0] && event.joined[0].teamMembers) {
    //       event.joined[0].teamMembers.push({id: this.loggedUser.id, name: this.loggedUser.username});
    //     } else {
    //       event.joined = [{ teamName: "Team" , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
    //     }
    //     this.setJoinOrCancel(event, true);
    //     break;
    //   }
    // }
  }

  canJoin(liveGame: LiveGame) {
    // let oke = false;
    // let canAddTeam = false;
    // let canAddMember = false;
    // if (liveGame.liveGameSettings.gameMode === GameMode.notSpecified && event.players) {
    //   oke = event.players.length < (event.liveGameSettings.maxTeam * event.liveGameSettings.maxTeamMember);
    // } else if (event.joined) {
    //   canAddTeam = event.liveGameSettings.maxTeam > event.joined.length;
    //   event.joined.forEach(team => {
    //     if (event.liveGameSettings.maxTeamMember > (team.teamMembers ? team.teamMembers.length : 0)) canAddMember = true;
    //   })
    // } else if (event.players) {
    //   oke = event.players.length < (event.liveGameSettings.maxTeam * event.liveGameSettings.maxTeamMember);
    // } else { oke = true }
    // return (oke || canAddTeam || canAddMember)
  }

  setJoinOrCancel(join: boolean) {
    // if (join) {
    //   if (this.event.players) {
    //     console.log("push id");
    //     this.event.players.push(this.user.id);
    //   }
    //   this.event.players = [this.user.id];
    // }
    // console.log(this.event);
    // this.eventsService.updateEvent(this.event).pipe(
    //   take(1),
    //   catchError(error => {
    //     return of(null)
    //   }),
    //   switchMap(eventId => {
    //     return this.userService.updateUser(
    //       this.user.id,
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       true,
    //       this.event.id,
    //       join)
    //   })).subscribe(response => {
    //   if (response) {
    //     this.showAlert((join ? "Join" : "Cancel") + " was succesful",
    //       join ? "You joined to " + this.event.name + " event" : "You have unsubscribed from " + this.event.name + " event");
    //   } else {
    //     this.showAlert("Something went wrong", (join ? "Join" : "Cancel") + " was unsuccesful.");
    //   }
    // });
  }

  setLiveGameSettings(event) {
    console.log(event);
    this.creatingLiveGameSetting = false;
    this.liveGameSettings = event;
    this.createLiveGame().subscribe(id => {
      if (id) {
        this.liveGame.id = id;
        console.log(this.liveGame);
      }
    });
  }

  createLiveGame() {
    let accessCode = Math.random().toString(16).slice(7);
    this.liveGame = new LiveGame(
      null,
      this.game.id,
      this.getEvent,
      this.getEvent ? this.event.id : null,
      this.liveGameSettings,
      accessCode,
      new Date()
    );
    return this.liveGameService.createLiveGame(this.liveGame);
  }

  createPlayer(teamName: string, teamMembers: {id: string, name: string}[]) {
    let checkpointStates: CheckpointState[] = [];
    for (let i = 0; i < this.game.checkpoints.length; i++) {
      let checkpointState: CheckpointState = {
        checkIndex: i,
        done: false,
        correctAnswer: null,
        useHelp: null,
        startTimestap: null,
        endTimestap: null
      };
      checkpointStates.push(checkpointState);
    }
    this.player = new Player(null, this.liveGame.id, teamName, teamMembers, checkpointStates);
    return this.liveGameService.createPlayer(this.player);
  }

  showALert(message: string ) {
    this.alertCtrl
      .create(
        {
          header: 'An error occured',
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


  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

}
