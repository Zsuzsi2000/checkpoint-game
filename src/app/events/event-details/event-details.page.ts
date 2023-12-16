import { Component, OnInit } from '@angular/core';
import {Game} from "../../models/game.model";
import {Event} from "../../models/event.model";
import {of, Subscription} from "rxjs";
import {User} from "../../models/user.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {GamesService} from "../../games/games.service";
import {AuthService} from "../../auth/auth.service";
import {UserService} from "../../services/user.service";
import {catchError, switchMap, take} from "rxjs/operators";
import {EventsService} from "../events.service";
import {LocationType} from "../../enums/LocationType";
import {GameMode} from "../../enums/GameMode";
import {JoinOrCreateTeamComponent} from "../../shared/components/join-or-create-team/join-or-create-team.component";
import {ChatType} from "../../enums/ChatType";
import {Chat} from "../../models/chat.model";
import {ConnectionsService} from "../../connections/connections.service";
import {ShareComponent} from "../../shared/components/share/share.component";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {

  event: Event;
  game: Game;
  isLoading = false;
  user: User;
  creator: User;
  ownEvent = false;
  LocationType = LocationType;
  GameMode = GameMode;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private gamesService: GamesService,
              private eventsService: EventsService,
              private authService: AuthService,
              private userService: UserService,
              private connectionsService: ConnectionsService,
              private alertController: AlertController,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('eventId')) {
        this.navCtrl.pop();
      }
      this.isLoading = true;
      this.eventsService.fetchEvent(paramMap.get('eventId')).pipe(
        take(1),
        catchError(error => {
          this.showAlertAndNavigate();
          return of(null);
        }),
        switchMap(event => {
          if (event) {
            this.event = event;
            return this.gamesService.fetchGame(this.event.gameId).pipe(take(1));
          } else {
            return of(null);
          }
        }),
        catchError(error => {
          this.showAlertAndNavigate();
          return of(null);
        }),
        switchMap(game => {
          if (game) {
            this.game = game;
            return this.userService.getUserById(this.event.creatorId).pipe(take(1));
          } else {
            return of(null);
          }
        }),
        catchError(error => {
          return of(null);
        }),
        switchMap(user => {
          if (user) {
            this.creator = user;
            return this.authService.user.pipe(take(1));
          } else {
            return of(null);
          }
        })
      ).subscribe(user => {
        this.isLoading = false;
        if (user) {
          this.user = user;
          this.ownEvent = (this.user.id === this.creator.id);
        }
      });
    });
  }

  navigateToGame() {
    this.router.navigate(['/', 'games', 'details', this.event.gameId ]);
  }

  showALert() {
    this.alertController
      .create(
        {
          header: this.translate.currentLang === "hu" ? 'Hiba történt' : 'An error occured',
          message: this.translate.currentLang === "hu" ? 'Az eseményt sajnos nem sikerült lekérni. Kérem próbálja meg később' : 'Event could not be fetched. Please try again later.',
          buttons: [{
            text: (this.translate.currentLang === "hu" ? 'Rendben' :'Okay'), handler: () => {
              this.router.navigate(['/', 'events']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  deleteEvent(id: string) {
    this.alertController.create({
      header: this.translate.currentLang === "hu" ? 'Esemény törlése' : "Delete event",
      message: this.translate.currentLang === "hu" ? 'Biztosan törölni szeretnéd az eseményt?' : "Are you sure you want to delete the event?",
      buttons: [
        {
          text: this.translate.currentLang === "hu" ? 'Vissza' : "Cancel",
          role: "cancel"
        },
        {
          text: this.translate.currentLang === "hu" ? 'Törlés' : "Delete",
          handler: () => {
            this.eventsService.deleteEvent(id).pipe(take(1)).subscribe(res => {
              this.router.navigate(['/', 'events']);
            });
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  editEvent(id: string) {
    this.router.navigate(['/', 'events', 'event-editor', id]);
  }

  startEvent() {
    this.router.navigate(['/', 'game-mode'], { queryParams: { eventId: this.event.id }});
  }

  canStartEvent() {
    return (new Date(this.event.date)).getTime() < (new Date()).getTime();
  }



  joinEvent() {
    switch (this.event.liveGameSettings.gameMode) {
      case GameMode.notSpecified: {
        this.setJoinOrCancel(true);
        break;
      }
      case GameMode.teamVsTeam: {
        this.modalCtrl.create({
          component: JoinOrCreateTeamComponent,
          componentProps: { event: this.event, user: this.user }
        }).then(modalEl => {
          modalEl.onDidDismiss().then(modalData => {
            if (modalData.data) {
              this.event = modalData.data;
              this.setJoinOrCancel(true);
            }
          });
          modalEl.present();
        });
        break;
      }
      case GameMode.againstEachOther: {
        if (this.event.joined) {
          this.event.joined.push({ teamName: this.user.username , teamMembers: [{id: this.user.id, name: this.user.username}] });
        } else {
          this.event.joined = [{ teamName: this.user.username , teamMembers: [{id: this.user.id, name: this.user.username}] }];
        }
        this.setJoinOrCancel(true);
        break;
      }
      case GameMode.teamGame: {
        if (this.event.joined && this.event.joined[0] && this.event.joined[0].teamMembers) {
          this.event.joined[0].teamMembers.push({id: this.user.id, name: this.user.username});
        } else {
          this.event.joined = [{ teamName: (this.translate.currentLang === "hu" ? "Csapat":"Team") , teamMembers: [{id: this.user.id, name: this.user.username}] }];
        }
        this.setJoinOrCancel(true);
        break;
      }
    }
  }

  canJoin() {
    let oke = false;
    let canAddTeam = false;
    let canAddMember = false;
    if (this.event.liveGameSettings.gameMode === GameMode.notSpecified && this.event.players) {
      oke = this.event.players.length < (this.event.liveGameSettings.maxTeam * this.event.liveGameSettings.maxTeamMember);
    } else if (this.event.joined) {
      canAddTeam = this.event.liveGameSettings.maxTeam > this.event.joined.length;
      this.event.joined.forEach(team => {
        if (this.event.liveGameSettings.maxTeamMember > (team.teamMembers ? team.teamMembers.length : 0)) canAddMember = true;
      })
    } else if (this.event.players) {
      oke = this.event.players.length < (this.event.liveGameSettings.maxTeam * this.event.liveGameSettings.maxTeamMember);
    } else { oke = true }
    return (oke || canAddTeam || canAddMember)
  }


  cancelEvent() {
    this.event.players = this.event.players.filter(player => player !== this.user.id);
    switch (this.event.liveGameSettings.gameMode) {
      case GameMode.teamVsTeam: {
        this.event.joined = this.event.joined.map(team => {
          return { teamName: team.teamName, teamMembers: team.teamMembers.filter(t => t.id !== this.user.id) }
        });
        this.event.joined = this.event.joined.filter(team => team.teamMembers.length !== 0);
        break;
      }
      case GameMode.againstEachOther: {
        this.event.joined = this.event.joined.filter(team => team.teamMembers[0].id !== this.user.id);
        break;
      }
      case GameMode.teamGame: {
        this.event.joined[0].teamMembers = this.event.joined[0].teamMembers.filter(member => member.id !== this.user.id);
        this.event.joined = this.event.joined.filter(team => team.teamMembers.length !== 0);
        break;
      }
    }
    this.setJoinOrCancel(false);
  }

  setJoinOrCancel(join: boolean) {
    if (join) {
      if (this.event.players) {
        this.event.players.push(this.user.id);
      }
      this.event.players = [this.user.id];
    }
    this.eventsService.updateEvent(this.event).pipe(
      take(1),
      catchError(error => {
        return of(null)
      }),
      switchMap(eventId => {
        return this.userService.updateUser(
          this.user.id,
          null,
          null,
          null,
          null,
          null,
          true,
          this.event.id,
          join).pipe(take(1));
      })).subscribe(response => {
      if (response) {
        this.showAlert((join
          ? (this.translate.currentLang === 'hu' ? 'A csatlakozás sikerült' : "Join was succesful" )
          : (this.translate.currentLang === 'hu' ? 'A visszavonás sikerült' :  "Cancel was succesful")),
          (this.translate.currentLang === 'hu'
            ? (join ? "Csatlakoztál a " + this.event.name + " eseményhez" : "Leiratkoztál a " + this.event.name + " eseményről")
            : (join ? "You joined to " + this.event.name + " event" : "You have unsubscribed from " + this.event.name + " event")));
      } else {
        this.translate.currentLang === 'hu'
          ? this.showAlert("Valami nem sikerült", (join ? "Csatlakozás" : "Leiratkozás") + " sikertelen volt.")
          : this.showAlert("Something went wrong", (join ? "Join" : "Cancel") + " was unsuccesful.");
      }
    });
  }

  goToChat() {
    this.connectionsService.fetchChats().pipe(take(1)).subscribe(chats => {
      if (chats) {
        let chat = chats.find(chat => chat.eventId === this.event.id);
        if (chat === undefined) {
          let newChat = new Chat(null, this.event.name, this.event.id, this.event.players,[], ChatType.eventGroup);
          this.connectionsService.createChat(newChat).pipe(take(1)).subscribe(id => {
            this.router.navigate(['/', 'connections', 'chat', id]);
          })
        } else {
          this.router.navigate(['/', 'connections', 'chat', chat.id]);
        }
      }
    });
  }

  shareEvent() {
    this.modalCtrl.create({ component: ShareComponent, componentProps: { user: this.user, event: this.event } }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (modalData.data) {
          this.router.navigate(['/', 'connections', 'chat', modalData.data]);
        }
      });
      modalEl.present();
    });
  }

  showAlertAndNavigate() {
    this.alertController
      .create(
        {
          header: this.translate.currentLang === 'hu' ? 'Hiba történt' : 'An error occured',
          message: this.translate.currentLang === 'hu' ? 'Az eseményt nem sikerült lekérni. Kérem próbálja újra.' : 'Event could not be fetched. Please try again later.',
          buttons: [{
            text: (this.translate.currentLang === 'hu' ? 'Rendben' : 'Okay'), handler: () => {
              this.router.navigate(['/', 'events']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  showAlert(header: string, message: string) {
    this.alertController.create(
      {
        header: header,
        message: message,
        buttons: [(this.translate.currentLang === 'hu' ? 'Rendben' : 'Okay')]
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
