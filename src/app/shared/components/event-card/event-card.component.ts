import {Component, Input, OnInit} from '@angular/core';
import {Event} from "../../../models/event.model";
import {GameMode} from "../../../enums/GameMode";
import {LocationType} from "../../../enums/LocationType";
import {JoinOrCreateTeamComponent} from "../join-or-create-team/join-or-create-team.component";
import {catchError, switchMap, take} from "rxjs/operators";
import {of} from "rxjs";
import {AlertController, ModalController} from "@ionic/angular";
import {Game} from "../../../models/game.model";
import {Router} from "@angular/router";
import {User} from "../../../models/user.model";
import {EventsService} from "../../../events/events.service";
import {UserService} from "../../../services/user.service";
import {UserData} from "../../../interfaces/UserData";

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
              private router: Router) { }

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
          componentProps: { event: event, userId: this.loggedUser.id }
        }).then(modalEl => {
          modalEl.onDidDismiss().then(modalData => {
            console.log(modalData.data);
            if (modalData.data) this.setJoinOrCancel(modalData.data, true);
          });
          modalEl.present();
        });
        break;
      }
      case GameMode.againstEachOther: {
        if (event.joined) {
          event.joined.push({ teamName: this.loggedUser.username , teamMembers: [this.loggedUser.id] });
        } else {
          event.joined = [{ teamName: this.loggedUser.username , teamMembers: [this.loggedUser.id] }];
        }
        this.setJoinOrCancel(event, true);
        break;
      }
      case GameMode.teamGame: {
        if (event.joined && event.joined[0]) {
          event.joined[0].teamMembers.push(this.loggedUser.id);
        } else {
          event.joined = [{ teamName: "Team" , teamMembers: [this.loggedUser.id] }];
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

  cancelEvent(event: Event) {
    event.players = event.players.filter(player => player !== this.loggedUser.id);
    console.log(event);

    switch (event.liveGameSettings.gameMode) {
      case GameMode.teamVsTeam: {
        event.joined[0].teamMembers = event.joined[0].teamMembers.filter(member => member !== this.loggedUser.id);
        event.joined.map(team => {
          return { teamName: team.teamName, teamMembers: team.teamMembers.filter(t => t !== this.loggedUser.id) }
        });

        //TODO: event.joined-ből is törlés
        break;
      }
      case GameMode.againstEachOther: {
        event.joined.filter(team => team.teamMembers[0] !== this.loggedUser.id);
        this.setJoinOrCancel(event, false);
        break;
      }
      case GameMode.teamGame: {
        event.joined[0].teamMembers = event.joined[0].teamMembers.filter(member => member !== this.loggedUser.id);
        this.setJoinOrCancel(event, false);
        break;
      }
    }
    console.log(event);
    this.setJoinOrCancel(event, false);
  }

  setJoinOrCancel(event: Event, join: boolean) {
    if (join) {
      if (event.players) {
        event.players.push(this.loggedUser.id);
      }
      event.players = [this.loggedUser.id];
    }
    console.log(event);
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

  goToChat(eventId: string) {
    //TODO: goToChat
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
