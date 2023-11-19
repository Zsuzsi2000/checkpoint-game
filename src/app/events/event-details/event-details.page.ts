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

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {

  event: Event;
  game: Game;
  eventSub: Subscription;
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
              private alertController: AlertController,
              private router: Router) {
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
          header: 'An error occured',
          message: 'Event could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
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
      header: "Delete event",
      message: "Are you sure you want to delete the event?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => {
            this.eventsService.deleteEvent(id).subscribe(res => {
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
    console.log((new Date(this.event.date)).getTime() < (new Date()).getTime(), new Date(this.event.date).getTime(),  (new Date()).getTime())
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
            console.log(modalData.data);
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
          this.event.joined = [{ teamName: "Team" , teamMembers: [{id: this.user.id, name: this.user.username}] }];
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
    console.log(this.event);

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
    console.log(this.event);
  }

  setJoinOrCancel(join: boolean) {
    if (join) {
      if (this.event.players) {
        console.log("push id");
        this.event.players.push(this.user.id);
      }
      this.event.players = [this.user.id];
    }
    console.log(this.event);
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
          join)
      })).subscribe(response => {
      if (response) {
        this.showAlert((join ? "Join" : "Cancel") + " was succesful",
          join ? "You joined to " + this.event.name + " event" : "You have unsubscribed from " + this.event.name + " event");
      } else {
        this.showAlert("Something went wrong", (join ? "Join" : "Cancel") + " was unsuccesful.");
      }
    });
  }

  goToChat() {
    //TODO: goToChat
  }

  showAlertAndNavigate() {
    this.alertController
      .create(
        {
          header: 'An error occured',
          message: 'Event could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
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
        buttons: ['Okay']
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

}
