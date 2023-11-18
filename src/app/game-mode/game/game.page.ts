import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {LiveGameService} from "../live-game.service";
import {Player} from "../../models/Player";
import {LiveGame} from "../../models/liveGame";
import {forkJoin, of, Subscription} from "rxjs";
import {LeaderboardComponent} from "./leaderboard/leaderboard.component";
import {CheckpointsComponent} from "./checkpoints/checkpoints.component";
import {GamesService} from "../../games/games.service";
import {AuthService} from "../../auth/auth.service";
import {take} from "rxjs/operators";
import {User} from "../../models/user.model";
import {Game} from "../../models/game.model";
import {Checkpoint} from "../../models/checkpoint.model";
import {LocationType} from "../../enums/LocationType";
import {LocationIdentification} from "../../enums/LocationIdentification";
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import {Capacitor} from "@capacitor/core";
import {Geolocation} from "@capacitor/geolocation";


@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {

  @ViewChild('scanner') scanner: ZXingScannerComponent;

  isLoading: boolean = true;
  liveGame: LiveGame;
  user: User;
  game: Game;
  player: Player;
  players: Player[] = [];
  actualCheckpoint: Checkpoint;
  playersSub: Subscription;
  LocationType = LocationType;
  LocationIdentification = LocationIdentification;
  showQuizOrInfo = false;
  answer = "";
  correctAnswer = null;
  useHelp = false;
  endDate: Date;
  qrScanner = false;
  last = false;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private liveGameService: LiveGameService,
              private gamesService: GamesService,
              private authService: AuthService,
              private alertController: AlertController,
              private modalController: ModalController,
              private router: Router) {
  }

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
    this.playersSub = this.liveGameService.fetchPlayers().subscribe(players => {
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
    const state = this.player.checkpointsState.find(s => s.done === false);
    if (state) {
      this.actualCheckpoint = this.game.checkpoints.find(check => check.index === state.checkIndex);
      console.log( this.actualCheckpoint.index, this.game.checkpoints.length, this.last)
      this.last = this.actualCheckpoint.index + 1 >= this.game.checkpoints.length;
      console.log( this.actualCheckpoint.index, this.game.checkpoints.length, this.last)

      if (this.actualCheckpoint.index + 1 > this.game.checkpoints.length - 1) this.last = true;
      this.showQuizOrInfo = state.find;
    } else {
      this.router.navigate(['/', 'game-mode', 'end', this.liveGame.id], {queryParams: {playerId: this.player.id}});
    }
    this.isLoading = false;
  }

  showALert(message: string = 'Game could not be fetched. Please try again later.') {
    this.alertController
      .create({
        header: 'Unfortunately it did not work out',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

  identifyLocation() {
    switch (this.game.locationType) {
      case LocationType.location: {
        this.checkLocation();
        break;
      }
      case LocationType.description: {
        if (this.game.locationIdentification === LocationIdentification.qr) {
          this.qrScanner = true;
          // this.modalController.create({component: QrCodeScannerComponent}).then(modalEl => {
          //   modalEl.onDidDismiss().then(modalData => {
          //     console.log(modalData.data);
          //   });
          //   modalEl.present();
          // });
        } else {
          this.checkAccessCode();
        }
        break;
      }
      case LocationType.anywhere: {
        this.findCheckpoint();
        break;
      }
    }
  }

  checkAccessCode() {
    this.alertController.create({
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
            if (event.accessCode && this.actualCheckpoint.locationAccessCode === event.accessCode) {
              this.findCheckpoint();
            } else {
              this.showALert('Unfortunately, the access code does not match..');
            }
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  checkQrCode(event) {
    console.log('Scan successful!', event);
    this.qrScanner = false;
    if (event && this.actualCheckpoint.locationAccessCode === event) {
      this.findCheckpoint();
    } else {
      this.showALert('Unfortunately, the access code does not match.');
    }
  }

  checkLocation() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showALert('Unable to determine your location.');
      return;
    }
    this.isLoading = true;
    Geolocation.getCurrentPosition()
      .then(geoPosition => {
        this.checkDistance(geoPosition.coords.latitude, geoPosition.coords.longitude);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showALert('Unable to determine your location.');
      });
  }

  checkDistance(myLat: number, myLng: number) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(this.actualCheckpoint.locationAddress.lat - myLat);
    const dLon = this.deg2rad(this.actualCheckpoint.locationAddress.lng - myLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(myLat)) * Math.cos(this.deg2rad(this.actualCheckpoint.locationAddress.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    console.log(myLat, myLng, this.actualCheckpoint.locationAddress, distance);
    if (distance < 0.1) {
      this.findCheckpoint();
    } else {
      this.showALert('Unfortunately you are not in the right place');
    }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  findCheckpoint() {
    this.player.checkpointsState = this.player.checkpointsState.map(c => {
      if (c.checkIndex === this.actualCheckpoint.index) {
        c.find = true;
        if (this.game.quiz) c.startTimestap = new Date();
      }
      return c;
    });
    this.player.duration = new Date().getTime() - new Date(this.liveGame.startDate).getTime();
    this.liveGameService.fetchPlayer(this.player.id).pipe(take(1)).subscribe(p => {
      if (p) {
        let canUpdate = false;
        p.checkpointsState.forEach(c => {
          if (c.checkIndex === this.actualCheckpoint.index && c.find !== true) {
            canUpdate = true;
          }
        });

        if (canUpdate) {
          this.liveGameService.updatePlayer(this.player).pipe(take(1)).subscribe(pl => {
            console.log(pl);
            this.showQuizOrInfo = true;
          });
        } else {
          this.player = p;
          this.showQuizOrInfo = true;
        }
      } else {
      }

    });
  }

  goToNextCheckpoint() {
    this.liveGameService.fetchPlayer(this.player.id).pipe(take(1)).subscribe(p => {
      if (p) {
        let canUpdate = false;
        p.checkpointsState.forEach(c => {
          if (c.checkIndex === this.actualCheckpoint.index && c.done !== true) {
            canUpdate = true;
          }
        });

        if (canUpdate) {
          this.player.checkpointsState = this.player.checkpointsState.map(c => {
            if (c.checkIndex === this.actualCheckpoint.index) {
              if (this.game.quiz) {
                c.correctAnswer = this.correctAnswer;
                c.useHelp = this.useHelp;
                c.endTimestap = this.endDate;

                this.player.score += (this.correctAnswer) ? 1 : 0;
                if (this.player.checkpointsDuration) {
                  this.player.checkpointsDuration += c.endTimestap.getTime() - new Date(c.startTimestap).getTime();
                } else {
                  this.player.checkpointsDuration = c.endTimestap.getTime() - new Date(c.startTimestap).getTime();
                }
              }
              c.done = true;
            }
            return c;
          });
          this.player.duration = new Date().getTime() - new Date(this.liveGame.startDate).getTime();

          this.liveGameService.updatePlayer(this.player).pipe(take(1)).subscribe(pl => {
            console.log(pl);
            this.showQuizOrInfo = false;
            this.answer = "";
            this.useHelp = false;
            this.correctAnswer = null;
            this.setActualCheckpoint();
          });
        } else {
          this.player = p;
          this.showQuizOrInfo = false;
          this.answer = "";
          this.useHelp = false;
          this.correctAnswer = null;
          this.setActualCheckpoint();
        }
      }
    });
  }

  setAnswer(userAnswer: { answer: string, correct: boolean }) {
    this.answer = userAnswer.answer;
  }

  setClass(a: { answer: string, correct: boolean }): ('good' | 'bad' | 'selected') {
    if (this.correctAnswer !== null && this.answer === a.answer && this.correctAnswer) {
      return 'good';
    } else if (this.correctAnswer !== null && this.answer === a.answer && !this.correctAnswer) {
      return 'bad';
    } else if (this.correctAnswer !== null && a.correct) {
      return 'good';
    } else if (this.correctAnswer === null && this.answer === a.answer) {
      return 'selected';
    }
  }

  checkAnswer() {
    this.correctAnswer = false;
    this.actualCheckpoint.quiz.answers.forEach(answer => {
      if (answer.answer.trim() === this.answer.trim() && answer.correct) {
        this.correctAnswer = true;
      }
    });
    this.endDate = new Date();
  }

  showHelp() {
    this.useHelp = true;
  }

  showLeaderboard() {
    this.modalController.create({
      component: LeaderboardComponent,
      componentProps: { liveGameId: this.liveGame.id, quiz: this.game.quiz }
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
      componentProps: {liveGameId: this.liveGame.id, playerId: this.player.id}
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
      });
      modalEl.present();
    });
  }

  back(){
    this.qrScanner = false;
  }

  ngOnDestroy(): void {
    if (this.playersSub) {
      this.playersSub.unsubscribe();
    }
  }

}
