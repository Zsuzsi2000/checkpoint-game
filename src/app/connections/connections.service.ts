import {Injectable} from '@angular/core';
import {ChatType} from '../enums/ChatType';
import {Connection} from "../models/connection.model";
import {Request} from "../models/request.model";
import {Chat} from "../models/chat.model";
import {map, switchMap, take, tap} from "rxjs/operators";
import {Message} from "../interfaces/Message";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, of} from "rxjs";
import {UserService} from "../services/user.service";
import {UserData} from "../interfaces/UserData";

interface ChatData {
  name: string,
  eventId: string,
  participants: string[],
  message: Message[],
  type: ChatType,
}

interface ConnectionData {
  userOneId: string;
  userTwoId: string;
}

interface RequestData {
  senderId: string;
  receiverId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  private _chats = new BehaviorSubject<Chat[]>([]);
  private _connections = new BehaviorSubject<Connection[]>([]);
  private _requests = new BehaviorSubject<Request[]>([]);

  get chats() {
    return this._chats.asObservable();
  }

  get connections() {
    return this._connections.asObservable();
  }

  get requests() {
    return this._requests.asObservable();
  }

  constructor(private http: HttpClient,
              private authService: AuthService,
              private userService: UserService) {
  }

  fetchChats() {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.get<{ [key: string]: ChatData }>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/chats.json?auth=${token}`);
      }),
      take(1),
      switchMap(data => {
        const chats: Chat[] = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            chats.push(new Chat(
              key,
              data[key].name,
              data[key].eventId ? data[key].eventId : null,
              data[key].participants,
              data[key].message ? data[key].message : [],
              data[key].type,
            ))
          }
        }
        return of(chats);
      }),
      tap(chats => {
        this._chats.next(chats);
      })
    );
  }

  fetchConnections() {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.get<{ [key: string]: ConnectionData }>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/connections.json?auth=${token}`);
      }),
      take(1),
      switchMap(data => {
        const connections: Connection[] = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            connections.push(new Connection(
              key,
              data[key].userOneId,
              data[key].userTwoId
            ))
          }
        }
        return of(connections);
      }),
      tap(connections => {
        this._connections.next(connections);
      })
    );
  }

  fetchRequests() {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.get<{ [key: string]: RequestData }>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/requests.json?auth=${token}`);
      }),
      switchMap(data => {
        console.log(data)
        const requests: Request[] = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            requests.push(new Request(
              key,
              data[key].senderId,
              data[key].receiverId
            ));
          }
        }
        console.log(requests);
        return of(requests);
      }),
      tap(requests => {
        this._requests.next(requests);
      })
    );
  }

  fetchChat(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        return this.http.get<ChatData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/chats/${id}.json?auth=${t}`);
      }),
      take(1),
      switchMap(chatData => {
        let chat = new Chat(
          id,
          chatData.name,
          chatData.eventId ? chatData.eventId : null,
          chatData.participants,
          chatData.message ? chatData.message : [],
          chatData.type
        );
        return of(chat);
      })
    );
  }

  fetchConnection(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.get<ConnectionData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/connections/${id}.json?auth=${token}`);
      }),
      take(1),
      switchMap(connectionData => {
        let connection = new Connection(id, connectionData.userOneId, connectionData.userTwoId);
        return of(connection);
      })
    );
  }

  fetchRequest(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.get<RequestData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/requests/${id}.json?auth=${token}`);
      }),
      take(1),
      switchMap(requestData => {
        let request = new Request(id, requestData.senderId, requestData.receiverId);
        return of(request);
      })
    );
  }

  createChat(chat: Chat) {
    let generatedId: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.post<{ name: string }>(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/chats.json?auth=${token}`,
          {...chat, id: null}
        );
      }),
      take(1),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        chat.id = id;
        this._chats.next([...this._chats.getValue(), chat]);
      })
    );
  }

  createConnection(connection: Connection) {
    let generatedId: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.post<{ name: string }>(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/connections.json?auth=${token}`,
          {...connection, id: null}
        );
      }),
      take(1),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        connection.id = id;
        this._connections.next([...this._connections.getValue(), connection]);
      })
    );
  }

  createRequest(request: Request) {
    let generatedId: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        let token = t;
        return this.http.post<{ name: string }>(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/requests.json?auth=${token}`,
          {...request, id: null}
        );
      }),
      take(1),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        request.id = id;
        this._requests.next([...this._requests.getValue(), request]);
      })
    );
  }

  updateChat(updatedChat: Chat) {
    let updatedChats: Chat[];
    let token;
    return this.authService.token.pipe(
      take(1),
      switchMap(t => {
        token = t;
        return this.chats.pipe(take(1));
      }),
      switchMap(chats => {
        if (!chats || chats.length < 1) {
          return this.fetchChats();
        } else {
          return of(chats);
        }
      }),
      switchMap(chats => {
        const updatedChatIndex = chats.findIndex(g => g.id === updatedChat.id);
        updatedChats = [...chats];
        const old = updatedChats[updatedChatIndex];
        updatedChats[updatedChatIndex] = updatedChat;
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/chats/${updatedChat.id}.json?auth=${token}`,
          {...updatedChats[updatedChatIndex], id: null}
        );
      }),
      tap(() => {
        this._chats.next(updatedChats);
      })
    );
  }

  deleteChat(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/chats/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.chats;
      }),
      take(1),
      tap(chats => {
        this._chats.next(chats.filter(b => b.id !== id));
      })
    );
  }

  deleteRequest(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/requests/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.requests;
      }),
      take(1),
      tap(requests => {
        this._requests.next(requests.filter(b => b.id !== id));
      })
    );
  }

  deleteConnection(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/connections/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.connections;
      }),
      take(1),
      tap(connections => {
        this._connections.next(connections.filter(b => b.id !== id));
      })
    );
  }

  getConnections(id: string) {
    let friends: Connection[] = [];

    return this.fetchConnections().pipe(
      take(1),
      map(connections => {
        friends = connections.filter(connection => (connection.userOneId === id || connection.userTwoId === id));
        return friends;
      })
    );
  }

  getFriends(id: string) {
    let friends: Connection[] = [];
    let knownUsers: UserData[] = [];

    return this.fetchConnections().pipe(
      take(1),
      switchMap(connections => {
        friends = connections.filter(connection => (connection.userOneId === id || connection.userTwoId === id));
        return this.userService.fetchUsers().pipe(take(1));
      }),
      take(1),
      map(users => {
        knownUsers = users.filter(user => (friends.find(friend => (friend.userTwoId === user.id || friend.userOneId === user.id)) !== undefined && user.id !== id));
        return knownUsers;
      })
    );
  }

  getChats(id: string) {
    let ownChats: Chat[] = [];
    return this.fetchChats().pipe(
      take(1),
      map(chats => {
        ownChats = chats.filter(chat => chat.participants.includes(id));
        return ownChats;
      })
    );
  }

  getRequests(id: string) {
    let ownRequests: Request[] = [];
    return this.fetchRequests().pipe(
      take(1),
      map(requests => {
        ownRequests = requests.filter(request => (request.senderId === id || request.receiverId === id));
        return ownRequests;
      })
    );
  }

  getUsersWithoutFriends(id: string) {
    let friends: Connection[] = [];
    let unknownUsers: UserData[] = [];

    return this.fetchConnections().pipe(
      take(1),
      switchMap(connections => {
        friends = connections.filter(connection => (connection.userOneId === id || connection.userTwoId === id));
        return this.userService.fetchUsers().pipe(take(1));
      }),
      take(1),
      map(users => {
        unknownUsers = users.filter(user => (friends.find(friend => (friend.userTwoId === user.id || friend.userOneId === user.id)) === undefined && user.id !== id));
        return unknownUsers;
      })
    );


    //
    // let friends: UserData[] = [];
    // let unknownUsers: UserData[] = [];
    //
    // return this.getFriends(id).pipe(
    //   take(1),
    //   switchMap(f => {
    //     friends = f;
    //     return this.userService.fetchUsers().pipe(take(1));
    //   }),
    //   take(1),
    //   map((users: UserData[]) => {
    //     unknownUsers = users.filter(user => !friends.includes(user) && user.id !== id);
    //     return unknownUsers;
    //   })
    // );
  }

}
