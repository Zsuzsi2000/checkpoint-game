import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Game} from "../models/game.model";
import {Event} from "../models/event.model";
import {EventsService} from "../events/events.service";
import {GamesService} from "../games/games.service";
import {GameMode} from "../enums/GameMode";
import {AuthService} from "../auth/auth.service";
import {Subscription} from "rxjs";
import {User} from "../models/user.model";
import {LiveGameSettings} from "../models/liveGameSettings";
import {LiveGame} from "../models/liveGame";
import {CheckpointState} from "../interfaces/CheckpointState";
import {LiveGameService} from "./live-game.service";
import {Player} from "../models/Player";
import {AlertController, LoadingController, ModalController, NavController} from "@ionic/angular";
import {JoinOrCreateTeamComponent} from "../shared/components/join-or-create-team/join-or-create-team.component";
import {take} from "rxjs/operators";

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
  waiting = false;
  creator = false;

  constructor(private activatedRoute: ActivatedRoute,
              private gamesService: GamesService,
              private eventsService: EventsService,
              private authService: AuthService,
              private liveGameService: LiveGameService,
              private router: Router,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private navCtrl: NavController,
              private loadingController: LoadingController) { }

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
            this.creator = true;
            if (this.liveGameSettings.gameMode === GameMode.notSpecified) {
              this.creatingLiveGameSetting = true;
            } else {
              this.createLiveGame().subscribe(id => {
                if (id) {
                  this.liveGame.id = id;
                  console.log(this.liveGame);
                  this.findJoinerAndCreatePlayer();
                }
              })
            }
          });
        }
      });
    }
  }

  findJoinerAndCreatePlayer() {
    let teamName = "";
    let teamMember: { id: string, name: string };
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (userId) {
        this.event.joined.forEach(team => {
          let member = team.teamMembers.find(m => m.id === this.user.id);
          if (member) {
            teamName = team.teamName;
            teamMember = member;
          }
        });
        this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
          if (players) {
            let player = (players as Player[]).find(p => (p.liveGameId === this.liveGame.id && p.teamName === teamName));
            if (player) {
              player.teamMembers.push(teamMember);
              this.updatePlayer(player);
            } else {
              this.createPlayer(teamName, [teamMember]);
            }
          }
        })
      }
    })
  }

  setSolo() {
    this.liveGameSettings = new LiveGameSettings(GameMode.solo, 1, 1);
    this.createLiveGame().subscribe(id => {
      if (id) {
        this.liveGame.id = id;
        console.log(this.liveGame);
        if (this.user) {
          this.createPlayer(this.user.username,[{ id: this.user.id, name: this.user.username }]);
        } else {
          this.createPlayer("Guest",[{ id: null, name: "Guest" }]);
        }
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
                if (this.liveGame.event) {
                  this.joinEvent();
                } else {
                  this.joinGame();
                }
              }
            })
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  joinEvent() {
    this.eventsService.fetchEvent(this.liveGame.eventId).subscribe(event => {
      if (event) {
        this.event = event;
        let signedUp = this.event.players.includes(this.user.id);
        if (!signedUp) {
          this.showAlert("An error occured","You haven't joined this event");
        } else {
          this.gamesService.fetchGame(this.liveGame.gameId).pipe(take(1)).subscribe(game => {
            if (game) {
              this.game = game;
              if (this.event.liveGameSettings.gameMode === GameMode.notSpecified) {
                this.joinMulti();
              } else {
                this.findJoinerAndCreatePlayer();
              }
            }
          });
        }
      }
    })
  }

  joinGame() {
    console.log("Join multi");
    this.gamesService.fetchGame(this.liveGame.gameId).pipe(take(1)).subscribe(game => {
      if (game) {
        this.game = game;
        this.joinMulti();
      }
    });
  }

  joinMulti() {
    //Todo: event esetén ellenőrizni hogy startDate van-e és benne van-e az event.players-ben
    switch (this.liveGame.liveGameSettings.gameMode) {
      case GameMode.notSpecified: {
        break;
      }
      case GameMode.teamVsTeam: {
        this.modalCtrl.create({
          component: JoinOrCreateTeamComponent,
          componentProps: {
            liveGame: this.liveGame,
            game: this.game,
            user: this.user,
            gameMode: true,
          }
        }).then(modalEl => {
          modalEl.onDidDismiss().then(modalData => {
            console.log(modalData.data);
            this.waiting = true;
          });
          modalEl.present();
        });
        break;
      }
      case GameMode.againstEachOther: {
        this.createPlayer(this.user.username, [{id: this.user.id, name: this.user.username}]);
        // if (event.joined) {
        //   event.joined.push({ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] });
        // } else {
        //   event.joined = [{ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
        // }
        break;
      }
      case GameMode.teamGame: {
        this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
          if (players) {
            let player = (players as Player[]).find(p => p.liveGameId === this.liveGame.id);
            if (player) {
              player.teamMembers.push({id: this.user.id, name: this.user.username});
              this.updatePlayer(player);
            } else {
              this.createPlayer("Team", [{id: this.user.id, name: this.user.username}]);
            }
          }
        });
        // if (event.joined && event.joined[0] && event.joined[0].teamMembers) {
        //   event.joined[0].teamMembers.push({id: this.loggedUser.id, name: this.loggedUser.username});
        // } else {
        //   event.joined = [{ teamName: "Team" , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
        // }
        break;
      }
    }
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


  setLiveGameSettings(event) {
    console.log(event);
    this.creatingLiveGameSetting = false;
    this.liveGameSettings = event;
    this.createLiveGame().subscribe(id => {
      if (id) {
        this.liveGame.id = id;
        console.log(this.liveGame);
        this.creator = true;
        this.joinMulti();
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
      this.liveGameSettings.gameMode === GameMode.solo ? new Date() : null
    );
    return this.liveGameService.createLiveGame(this.liveGame);
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
    this.player = new Player(null, this.liveGame.id, teamName, teamMembers, checkpointStates);
    this.loadingController.create({ keyboardClose: true, message: 'Create team...',  }).then(loadingEl => {
      loadingEl.present();
      this.liveGameService.createPlayer(this.player).pipe(take(1)).subscribe(createdPlayer => {
        if (createdPlayer) {
          console.log(createdPlayer);
          // this.player = player;
          loadingEl.dismiss();
          this.waiting = true;
        }
      }, error => {
        this.showAlert('Failed', 'Something went wrong');
      });
    });
  }

  updatePlayer(player: Player) {
    this.loadingController.create({ keyboardClose: true, message: 'Update team...',  }).then(loadingEl => {
      loadingEl.present();
      this.liveGameService.updatePlayer(player).pipe(take(1)).subscribe(updatedPlayer => {
        if (updatedPlayer) {
          console.log(updatedPlayer);
          this.player = player;
          loadingEl.dismiss();
          this.waiting = true;
        }
      }, error => {
        this.showAlert('Failed', 'Something went wrong');
      });

    });
  }

  showAlert(header: string, message: string) {
    this.alertCtrl
      .create(
        {
          header: header,
          message: message,
          buttons: [{
            text: 'Okay', handler: () => {

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
