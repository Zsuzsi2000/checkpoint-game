export interface Permissions {
  message: boolean;
  friendRequests: boolean;
  eventReminder: boolean;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  country: string;
  picture: string;
  favouriteGames: string[];
  eventsUserSignedUpFor: string[];
  savedEvents: string[];
  permissions: Permissions;
}
