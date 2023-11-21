import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LiveGameSettings} from "../../models/liveGameSettings";
import {GameMode} from "../../enums/GameMode";
import {Event} from "../../models/event.model";

@Component({
  selector: 'app-create-multi',
  templateUrl: './create-multi.component.html',
  styleUrls: ['./create-multi.component.scss'],
})
export class CreateMultiComponent implements OnInit {

  @Input() event: Event;
  @Output() sendLiveGameSetting = new EventEmitter<LiveGameSettings>();
  liveGameSetting: LiveGameSettings = new LiveGameSettings(GameMode.againstEachOther);
  maxTeam = 5;
  maxTeamMember = 1;
  GameMode = GameMode;

  constructor() {
  }

  ngOnInit() {
  }

  checkEveryPlayersCanJoin() {
    if (this.event && this.event.players) {
      return this.event.players.length <= (this.maxTeam * this.maxTeamMember)
    } else {
      return true;
    }
  }

  setGameMode(event) {
    this.liveGameSetting.gameMode = +event.detail.value as GameMode;
    if (this.liveGameSetting.gameMode === GameMode.againstEachOther) {
      this.maxTeamMember = 1;
    } else if (this.liveGameSetting.gameMode === GameMode.teamGame) {
      this.maxTeam = 1;
    }
  }

  createLiveGameSettings() {
    this.liveGameSetting.maxTeam = this.maxTeam;
    this.liveGameSetting.maxTeamMember = this.maxTeamMember;
    if (this.liveGameSetting.gameMode === GameMode.teamGame) {
      this.liveGameSetting.maxTeam = 1;
    } else if (this.liveGameSetting.gameMode === GameMode.againstEachOther) {
      this.liveGameSetting.maxTeamMember = 1;
    }
    this.sendLiveGameSetting.emit(this.liveGameSetting);
  }

}
