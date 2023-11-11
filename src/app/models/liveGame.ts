import {LiveGameSettings} from "./liveGameSettings";
import {Player} from "../interfaces/Player";

export class LiveGame {
  constructor(
    public id: string,
    public gameId: string,
    public liveGameSettings: LiveGameSettings,
    public accessCode: number,
    public startDate: Date,
    public players: Player[] = [],
  ) {}
}
