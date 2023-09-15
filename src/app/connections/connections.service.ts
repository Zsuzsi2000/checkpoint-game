import {Injectable} from '@angular/core';
import {Chat} from '../interfaces/Chat';
import {ChatType} from '../enums/ChatType';
import {Friend} from '../interfaces/Friend';


@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  private _users = [];

  constructor() { }
  get users() {
    return [...this._users];
  }

  getFriends(userId: number) {
    const friends: Friend[] = [
      { userName: 'Roli' },
      { userName: 'Noémi' },
      { userName: 'Virág' },
      { userName: 'Elena' },
      { userName: 'Dave' },
    ];
    return friends;
  }

  getChats(userId: number) {
    const chats: Chat[] = [
      { userName: 'Roli', type: ChatType.personal },
      { userName: 'Noémi', type: ChatType.group },
      { userName: 'Virág', type: ChatType.eventGroup }
    ];
    return chats;
  }

}
