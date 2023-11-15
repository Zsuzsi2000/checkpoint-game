import {LiveGameSettings} from "./liveGameSettings";
import {Player} from "../interfaces/Player";

export class LiveGame {
  constructor(
    public id: string,
    public gameId: string,
    public liveGameSettings: LiveGameSettings,
    public accessCode: string,
    public startDate: Date,
    public players: Player[] = [],
  ) {}
}
