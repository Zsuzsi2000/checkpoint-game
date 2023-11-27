export interface TeamMember {
  id: string;
  name: string;
}

export interface Joined {
  teamName: string;
  teamMembers: TeamMember[];
}
