import {Permissions} from "../interfaces/UserData";

export class User {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public country: string,
    public picture: string,
    public favouriteGames: string[],
    public eventsUserSignedUpFor: string[],
    public savedEvents: string[],
    public permissions: Permissions,
    private _token: string,
    private tokenExpirationDate: Date,
  ) {}

  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    return this._token;
  }

  get tokenDuration() {
    if (!this.token) {
      return 0;
    }
    return this.tokenExpirationDate.getTime() - new Date().getTime();
  }

}
