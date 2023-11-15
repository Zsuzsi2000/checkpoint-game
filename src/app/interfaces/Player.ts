import {CheckpointState} from "./CheckpointState";

export interface Player {
  teamName: string;
  teamMembers: {id: string, name: string}[];
  score: number;
  duration: number;
  checkpointsState: CheckpointState[],
}
