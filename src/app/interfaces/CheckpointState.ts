export interface CheckpointState {
  checkIndex: number;
  find: boolean;
  done: boolean;
  correctAnswer: boolean;
  useHelp: boolean;
  startTimestap: Date;
  endTimestap: Date;
}
