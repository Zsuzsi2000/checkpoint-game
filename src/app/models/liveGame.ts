import {LiveGameSettings} from "./liveGameSettings";

export class LiveGame {
  constructor(
    public id: string,
    public gameId: string,
    public event: boolean,
    public eventId: string,
    public liveGameSettings: LiveGameSettings,
    public accessCode: string,
    public startDate: Date,
  ) {}
}
