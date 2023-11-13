import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Event} from "../../../models/event.model"

@Component({
  selector: 'app-join-or-create-team',
  templateUrl: './join-or-create-team.component.html',
  styleUrls: ['./join-or-create-team.component.scss'],
})
export class JoinOrCreateTeamComponent implements OnInit {

  @Input() event: Event;
  @Input() userId: string;
  join: boolean;
  chosenTeam = "";
  canJoinToATeam: boolean;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.canJoinToATeam = false;
    this.join = false;
    console.log(this.event);
    if (this.event.joined) {
      this.chosenTeam = this.event.joined.length > 0 ? this.event.joined[0].teamName : "";
      this.event.joined.forEach(team => {
        if (team.teamMembers.length < this.event.liveGameSettings.maxTeamMember) {
          this.canJoinToATeam = true;
          this.join = true;
        }
      })
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  setJoin(event) {
    console.log(event, this.join);
    this.join = event.detail.value;
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
          team.teamMembers.push(this.userId);
        }
        return team;
      })
    } else {
      this.event.joined
        ? this.event.joined.push({ teamName: this.chosenTeam, teamMembers: [this.userId] })
        : [{ teamName: this.chosenTeam, teamMembers: [this.userId] }];
    }
    console.log(this.event);
    this.modalCtrl.dismiss(this.event);
  }

}
