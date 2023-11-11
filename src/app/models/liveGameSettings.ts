import {GameMode} from "../enums/GameMode";

export class LiveGameSettings {
  constructor(
    public gameMode: GameMode = GameMode.notSpecified,
    public maxTeam: number = 20,
    public maxTeamMember: number = 20,
  ) {}
}
