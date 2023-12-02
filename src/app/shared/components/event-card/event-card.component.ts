import {Component, Input, OnInit} from '@angular/core';
import {Event} from "../../../models/event.model";
import {GameMode} from "../../../enums/GameMode";
import {LocationType} from "../../../enums/LocationType";
import {JoinOrCreateTeamComponent} from "../join-or-create-team/join-or-create-team.component";
import {ShareComponent} from "../share/share.component";
import {catchError, switchMap, take} from "rxjs/operators";
import {of} from "rxjs";
import {AlertController, ModalController} from "@ionic/angular";
import {Game} from "../../../models/game.model";
import {Router} from "@angular/router";
import {User} from "../../../models/user.model";
import {EventsService} from "../../../events/events.service";
import {UserService} from "../../../services/user.service";
import {UserData} from "../../../interfaces/UserData";
import {Chat} from "../../../models/chat.model";
import {ChatType} from "../../../enums/ChatType";
import {ConnectionsService} from "../../../connections/connections.service";

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit {

  @Input() event!: Event;
  @Input() profile!: boolean;
  @Input() ownProfile!: boolean;
  @Input() game: Game;
  @Input() loggedUser: User;
  @Input() loadedUser: UserData = null;

  LocationType = LocationType;

  constructor(private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private eventsService: EventsService,
              private userService: UserService,
              private router: Router,
              private connectionsService: ConnectionsService) { }

  ngOnInit() {
    if (this.loggedUser) {
      if (this.loadedUser === null) {
        this.loadedUser = {
          id: this.loggedUser.id,
          email: this.loggedUser.email,
          username: this.loggedUser.username,
          country: this.loggedUser.country,
          picture: this.loggedUser.picture,
          favouriteGames: this.loggedUser.favouriteGames,
          eventsUserSignedUpFor: this.loggedUser.eventsUserSignedUpFor,
          savedEvents: this.loggedUser.savedEvents,
          permissions: this.loggedUser.permissions,
        };
      }
    }
  }

  joinEvent(event: Event) {
    switch (event.liveGameSettings.gameMode) {
      case GameMode.notSpecified: {
        this.setJoinOrCancel(event, true);
        break;
      }
      case GameMode.teamVsTeam: {
        this.modalCtrl.create({
          component: JoinOrCreateTeamComponent,
          componentProps: { event: event, user: this.loggedUser }
        }).then(modalEl => {
          modalEl.onDidDismiss().then(modalData => {
            if (modalData.data) this.setJoinOrCancel(modalData.data, true);
          });
          modalEl.present();
        });
        break;
      }
      case GameMode.againstEachOther: {
        if (event.joined) {
          event.joined.push({ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] });
        } else {
          event.joined = [{ teamName: this.loggedUser.username , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
        }
        this.setJoinOrCancel(event, true);
        break;
      }
      case GameMode.teamGame: {
        if (event.joined && event.joined[0] && event.joined[0].teamMembers) {
          event.joined[0].teamMembers.push({id: this.loggedUser.id, name: this.loggedUser.username});
        } else {
          event.joined = [{ teamName: "Team" , teamMembers: [{id: this.loggedUser.id, name: this.loggedUser.username}] }];
        }
        this.setJoinOrCancel(event, true);
        break;
      }
    }
  }

  canJoin(event: Event) {
    let oke = false;
    let canAddTeam = false;
    let canAddMember = false;
    if (event.liveGameSettings.gameMode === GameMode.notSpecified && event.players) {
      oke = event.players.length < (event.liveGameSettings.maxTeam * event.liveGameSettings.maxTeamMember);
    } else if (event.joined) {
      canAddTeam = event.liveGameSettings.maxTeam > event.joined.length;
      event.joined.forEach(team => {
        if (event.liveGameSettings.maxTeamMember > (team.teamMembers ? team.teamMembers.length : 0)) canAddMember = true;
      })
    } else if (event.players) {
      oke = event.players.length < (event.liveGameSettings.maxTeam * event.liveGameSettings.maxTeamMember);
    } else { oke = true }
    return (oke || canAddTeam || canAddMember)
  }

  startEvent() {
    this.router.navigate(['/', 'game-mode'], { queryParams: { eventId: this.event.id }});
  }

  canStartEvent() {
    return (new Date(this.event.date)).getTime() < (new Date()).getTime();
  }

  cancelEvent(event: Event) {
    event.players = event.players.filter(player => player !== this.loggedUser.id);

    switch (event.liveGameSettings.gameMode) {
      case GameMode.teamVsTeam: {
        event.joined = event.joined.map(team => {
          return { teamName: team.teamName, teamMembers: team.teamMembers.filter(t => t.id !== this.loggedUser.id) }
        });
        event.joined = this.event.joined.filter(team => team.teamMembers.length !== 0);
        break;
      }
      case GameMode.againstEachOther: {
        event.joined = event.joined.filter(team => team.teamMembers[0].id !== this.loggedUser.id);
        break;
      }
      case GameMode.teamGame: {
        event.joined[0].teamMembers = event.joined[0].teamMembers.filter(member => member.id !== this.loggedUser.id);
        event.joined = this.event.joined.filter(team => team.teamMembers.length !== 0);
        break;
      }
    }
    this.setJoinOrCancel(event, false);
  }

  setJoinOrCancel(event: Event, join: boolean) {
    if (join) {
      if (event.players) {
        event.players.push(this.loggedUser.id);
      } else {
        event.players = [this.loggedUser.id];
      }
    }
    this.eventsService.updateEvent(event).pipe(
      take(1),
      catchError(error => {
        return of(null)
      }),
      switchMap(eventId => {
        return this.userService.updateUser(
          this.loggedUser.id,
          null,
          null,
          null,
          null,
          null,
          true,
          event.id,
          join)
      })).subscribe(response => {
      if (response) {
        this.showAlertWithCustomParameters((join ? "Join" : "Cancel") + " was succesful",
          join ? "You joined to " + event.name + " event" : "You have unsubscribed from " + event.name + " event");
      } else {
        this.showAlertWithCustomParameters("Something went wrong", (join ? "Join" : "Cancel") + " was unsuccesful.");
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
    this.modalCtrl.create({ component: ShareComponent, componentProps: { user: this.loggedUser, event: this.event } }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (modalData.data) {
          console.log(modalData.data);
          this.router.navigate(['/', 'connections', 'chat', modalData.data]);
        }
      });
      modalEl.present();
    });
  }

  deleteEvent(id: string) {
    this.alertCtrl.create({
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

  getDays(date: Date | string) {
    date = new Date(date);
    const timeDifference = Math.abs(date.getTime() - new Date().getTime());
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  }

  showAlertWithCustomParameters(header: string, message: string) {
    this.alertCtrl.create(
      {
        header: header,
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
