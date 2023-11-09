import {Injectable, OnInit} from '@angular/core';
import {map, switchMap, take, tap} from "rxjs/operators";
import {AuthResponseData, AuthService} from "../auth/auth.service";
import {UserData} from "../interfaces/UserData";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, of} from "rxjs";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  private _users = new BehaviorSubject<UserData[]>(null);

  get users() {
    return this._users.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.fetchUsers().pipe(take(1)).subscribe(users => {
      this._users.next(users);
    })
  }

  createUser(userData: AuthResponseData, username: string, country: string) {
    console.log("createUser");
    const newUser: UserData = {
      id: null,
      email: userData.email,
      username: username,
      country: country,
      picture: "",
      favouriteGames: []
    };

    let generatedId: string;
    return this.http.post<{ name: string }>('https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users.json',
      {...newUser, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.users;
        }),
        take(1),
        tap(users => {
          newUser.id = generatedId;
          this._users.next((users) ? users.concat(newUser) : [newUser]);
        })
      )
  }

  getUserByEmail(email: string) {
    return this.http.get<{ [key: string]: UserData }>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users.json`)
      .pipe(
        map(data => {
          let user: User;
          for (const key in data) {
            if (data.hasOwnProperty(key) && data[key].email === email) {
              user = new User(
                key,
                data[key].email,
                data[key].username,
                data[key].country,
                data[key].picture,
                data[key].favouriteGames,
                null,
                null
              );
            }
          }
          return user;
        })
      )
  }

  getUserById(id: string) {
    return this.http.get<UserData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users/${id}.json`).pipe(
      map(userData => {
        return new User(
          id,
          userData.email,
          userData.username,
          userData.country,
          userData.picture,
          userData.favouriteGames,
          null,
          null
        );
      })
    );
  }

  fetchUsers() {
    console.log("fetchUsers");
    return this.http.get<{ [key: string]: UserData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users.json")
      .pipe(
        map(data => {
          const users: UserData[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const user: UserData = {
                id: key,
                email: data[key].email,
                username: data[key].username,
                country: data[key].country,
                picture: data[key].picture,
                favouriteGames: data[key].favouriteGames
              };
              users.push(user);
            }
          }
          return users;
        }),
        tap(users => {
          this._users.next(users);
        })
      );
  }

  updateUser(id: string,
             email: string,
             username: string,
             country: string,
             picture: string,
             gameId: string,
             addFavourite: boolean) {

    console.log("updateUser", gameId, addFavourite)
    let updatedUsers: UserData[];
    let updatedUserIndex: number;
    return this.users.pipe(
      take(1),
      switchMap(users => {
        if (!users || users.length < 0) {
          return this.fetchUsers();
        } else {
          return of(users);
        }
      }),
      switchMap(users => {
        console.log("users", users )
        updatedUserIndex = users.findIndex(u => u.id === id);
        updatedUsers = [...users];
        const old: UserData = updatedUsers[updatedUserIndex];
        console.log("old", updatedUsers[updatedUserIndex] );
        if (old.favouriteGames === undefined || null) {
          old.favouriteGames = [];
        }

        updatedUsers[updatedUserIndex] = {
          id: id,
          email: (email) ? email : old.email,
          username: (username) ? username : old.username,
          country: (country) ? country : old.country,
          picture: (picture) ? picture : old.picture,
          favouriteGames: (gameId)
            ? ((addFavourite) ? old.favouriteGames.concat(gameId) : old.favouriteGames.filter(g => g != gameId))
            : old.favouriteGames
        };

        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users/${id}.json`,
          {...updatedUsers[updatedUserIndex], id: null}
        );
      }),
      tap(() => {
        this._users.next(updatedUsers);
        this.authService.setUser(updatedUsers[updatedUserIndex]);
      })
    )
  }

  deleteUser(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.users;
      }),
      take(1),
      tap(users => {
        this._users.next(users.filter(u => u.id !== id));
        this.authService.logout();
      })
    );
  }
}
