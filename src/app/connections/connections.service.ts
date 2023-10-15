import {Injectable} from '@angular/core';
import {Chat} from '../interfaces/Chat';
import {ChatType} from '../enums/ChatType';
import {User} from '../interfaces/User';


@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  private _users: User[] = [
    { email: 'roli@gmail.com', userName: 'Roli' },
    { email: 'noemi@gmail.com', userName: 'Noémi' },
    { email: 'virag@gmail.com', userName: 'Virág' },
    { email: 'elena@gmail.com', userName: 'Elena' },
    { email: 'dave@gmail.com', userName: 'Dave' },
    { email: 'pal@gmail.com', userName: 'Pál' },
    { email: 'kitti@gmail.com', userName: 'Kitti' },
    { email: 'janika@gmail.com', userName: 'Janika' },
    { email: 'eva@gmail.com', userName: 'Éva' },
    { email: 'dave2@gmail.com', userName: 'Dave' },
  ];

  constructor() { }
  get users() {
    return [...this._users];
  }

  getFriends(email: string) {
    const friends: User[] = [
      { email: 'roli@gmail.com', userName: 'Roli' },
      { email: 'noemi@gmail.com', userName: 'Noémi' },
      { email: 'virag@gmail.com', userName: 'Virág' },
      { email: 'elena@gmail.com', userName: 'Elena' },
      { email: 'dave@gmail.com', userName: 'Dave' },
    ];
    return friends;
  }

  getChats(email: string) {
    const chats: Chat[] = [
      { userEmail: 'roli@gmail.com', partnerName: 'Roli', type: ChatType.personal },
      { userEmail: 'noemi@gmail.com', partnerName: 'Noémi', type: ChatType.group },
      { userEmail: 'virag@gmail.com', partnerName: 'Virág', type: ChatType.eventGroup }
    ];
    return chats;
  }

  getUsersWithoutFriends(email: string){
    const friends = this.getFriends(email);
    const unknownUsers: User[] = [];
    this.users.forEach( user => {
      const person = friends.find( (friend) => friend.email === user.email);
      if (person === undefined) {
        unknownUsers.push(user);
      }
    });
    return unknownUsers;
  }

}
