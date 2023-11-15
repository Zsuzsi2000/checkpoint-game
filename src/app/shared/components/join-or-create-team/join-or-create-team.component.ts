import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Event} from "../../../models/event.model"
import {User} from "../../../models/user.model";

@Component({
  selector: 'app-join-or-create-team',
  templateUrl: './join-or-create-team.component.html',
  styleUrls: ['./join-or-create-team.component.scss'],
})
export class JoinOrCreateTeamComponent implements OnInit {

  @Input() event: Event;
  @Input() user: User;
  join: boolean;
  chosenTeam = "";
  canJoinToATeam: boolean;
  canCreateATeam: boolean;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.canJoinToATeam = false;
    this.canCreateATeam = false;
    this.join = false;
    console.log(this.event);
    if (this.event.joined) {
      console.log("letezik joined");
      this.chosenTeam = this.event.joined.length > 0 ? this.event.joined[0].teamName : "";
      if (this.event.joined.length < this.event.liveGameSettings.maxTeam) {
        console.log("canCreate");
        this.canCreateATeam = true;
        this.join = false;
      }
      this.event.joined.forEach(team => {
        if (team.teamMembers.length < this.event.liveGameSettings.maxTeamMember) {
          console.log("canJoin");
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

  onCancel() {
    this.modalCtrl.dismiss();
  }

  setJoin(event) {
    console.log(event, this.join);
    this.join = event.detail.value === "true";
    this.chosenTeam = "";
    console.log(event, this.join);
  }

  setTeam(team: string) {
    this.chosenTeam = team;
  }

  submit() {
    if (this.join) {
      this.event.joined = this.event.joined.map(team => {
        if (team.teamName === this.chosenTeam) {
          if (team.teamMembers) {
            team.teamMembers.push({id: this.user.id, name: this.user.username});
          } else {
            team.teamMembers = [{id: this.user.id, name: this.user.username }];
          }
        }
        return team;
      })
    } else {
      this.event.joined
        ? this.event.joined.push({ teamName: this.chosenTeam, teamMembers: [{id: this.user.id, name: this.user.username }] })
        : [{ teamName: this.chosenTeam, teamMembers: [{id: this.user.id, name: this.user.username }] }];
    }
    console.log(this.event);
    this.modalCtrl.dismiss(this.event);
  }

}
