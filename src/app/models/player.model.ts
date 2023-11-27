import {CheckpointState} from "../interfaces/CheckpointState";
import {TeamMember} from "../interfaces/Joined";

export class PlayerModel {
  constructor(
    public id: string,
    public liveGameId: string,
    public teamName: string,
    public teamMembers: TeamMember[],
    public checkpointsState: CheckpointState[],
    public score: number = 0,
    public duration: number = null,
    public checkpointsDuration: number = 0,
  ) {}
}
