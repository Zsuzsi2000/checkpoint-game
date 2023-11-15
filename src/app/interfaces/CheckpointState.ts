export interface CheckpointState {
  checkIndex: number;
  done: boolean;
  correctAnswer: boolean;
  useHelp: boolean;
  startTimestap: Date;
  endTimestap: Date;
}
