import {CheckpointState} from "../interfaces/CheckpointState";

export class Player {
  constructor(
    public id: string,
    public liveGameId: string,
    public teamName: string,
    public teamMembers: {id: string, name: string}[],
    public checkpointsState: CheckpointState[],
    public score: number = 0,
    public duration: number = null,
    public checkpointsDuration: number = null,
  ) {}
}
