import {LiveGameSettings} from "./liveGameSettings";
import {Joined} from "../interfaces/Joined";

export class Event {
  constructor(
    public id: string,
    public name: string,
    public date: Date,
    public creationDate: Date,
    public isItPublic: boolean,
    public imgUrl: string,
    public creatorId: string,
    public gameId: string,
    public description: string = null,
    public liveGameSettings: LiveGameSettings = new LiveGameSettings(),
    public players: string[] = [],
    public joined: Joined[] = [],
  ) {}
}
