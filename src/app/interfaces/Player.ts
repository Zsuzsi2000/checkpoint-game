export interface Player {
  teamName: string;
  teamMembers: string[];
  score: number;
  duration: number;
  checkpointsState: {
    checkIndex: number;
    done: boolean;
    correctAnswer: boolean;
    useHelp: boolean;
    timestap: Date;
  }[],
}
