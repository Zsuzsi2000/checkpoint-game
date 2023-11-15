import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LiveGameSettings} from "../../models/liveGameSettings";
import {GameMode} from "../../enums/GameMode";

@Component({
  selector: 'app-create-multi',
  templateUrl: './create-multi.component.html',
  styleUrls: ['./create-multi.component.scss'],
})
export class CreateMultiComponent implements OnInit {

  @Output() sendLiveGameSetting = new EventEmitter<LiveGameSettings>();
  liveGameSetting: LiveGameSettings = new LiveGameSettings(GameMode.againstEachOther);
  maxTeam = 5;
  maxTeamMember = 5;
  GameMode = GameMode;

  constructor() {
  }

  ngOnInit() {
  }

  setGameMode(event) {
    console.log(event);
    this.liveGameSetting.gameMode = +event.detail.value as GameMode;
  }

  createLiveGameSettings() {
    this.liveGameSetting.maxTeam = this.maxTeam;
    this.liveGameSetting.maxTeamMember = this.maxTeamMember;
    if (this.liveGameSetting.gameMode === GameMode.teamGame) {
      this.liveGameSetting.maxTeam = 1;
    } else if (this.liveGameSetting.gameMode === GameMode.againstEachOther) {
      this.liveGameSetting.maxTeamMember = 1;
    }
    console.log(this.liveGameSetting);
    this.sendLiveGameSetting.emit(this.liveGameSetting);
  }

}
