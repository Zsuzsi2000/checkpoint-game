import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, from, interval} from "rxjs";
import {User} from "../models/user.model";
import {map, switchMap, take, takeWhile, tap} from "rxjs/operators";
import {Plugins} from "@capacitor/core";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.token;
      } else {
        return false;
      }
    }));
  }

  get user() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user;
      } else {
        return null;
      }
    }));
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  get token() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.token;
      } else {
        return null;
      }
    }));
  }

  constructor(private http: HttpClient) {
  }

  autoLogin() {
    return from(Plugins.Storage.get({key: 'authData'})).pipe(
      map(storedData => {
        if (!storedData || !(storedData as { key: string; value: string }).value) {
          return null;
        }
        const parsedData = JSON.parse((storedData as { key: string; value: string }).value) as {
          id: string;
          email: string;
          username: string;
          country: string;
          picture: string;
          token: string;
          tokenExpirationDate: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        return new User(parsedData.id, parsedData.email, parsedData.username, parsedData.country,
          parsedData.picture, [], parsedData.token, expirationTime);
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  // signup(email: string, password: string, username: string, country: string, picture: string) {
  //   return this.http.post<AuthResponseData>(
  //     `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
  //       environment.firebaseAPIKey
  //     }`,
  //     {email, password, returnSecureToken: true}
  //   ).pipe(tap(this.setUserData.bind(this, username, country, picture)));
  // }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
        environment.firebaseAPIKey
      }`,
      {email, password, returnSecureToken: true}
    )
  }

  login(email: string, password: string) {
    console.log("login", email, password);
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
        environment.firebaseAPIKey
      }`,
      {email, password, returnSecureToken: true}
    )
  }

  loginAsAGuest() {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
        environment.firebaseAPIKey
      }`,
      {returnSecureToken: true}
    );
  }

  sendPasswordResetEamil(email: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${
        environment.firebaseAPIKey
      }`,
      {requestType: 'PASSWORD_RESET', email}
    );
  }

  changeEmail(newEmail: string) {
    const token = this.token.pipe(take(1)).subscribe(t => {
      return t;
    });
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${
        environment.firebaseAPIKey
      }`,
      {idToken: token, email: newEmail, returnSecureToken: true}
    );
  }

  sendEmailVerification(token: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${
        environment.firebaseAPIKey
      }`,
      {requestType: 'VERIFY_EMAIL', idToken: token}
    );
  }

  getUserData(token: string) {
    return this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${
        environment.firebaseAPIKey
      }`,
      {idToken: token}
    );
  }

  deleteAccount() {
    const token = this.token.pipe(take(1)).subscribe(t => {
      return t;
    });
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${
        environment.firebaseAPIKey
      }`,
      {idToken: token}
    );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    console.log("autoLogout", this._user);

    Plugins.Storage.remove({key: 'authData'});
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration)
  }

  createUser(userData: AuthResponseData, username: string, country: string, imgUrl: string) {
    console.log("createUser");

    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(userData.localId, userData.email, username, country, imgUrl, [], userData.idToken, expirationTime);

    let generatedId: string;
    return this.http.post<{name: string}>('https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/users.json',
      { ...user, id: null})
      .pipe(
        switchMap( resData => {
          generatedId = resData.name;
          return this.user;
        }),
        take(1),
        tap(user => {
          user.id = generatedId;
        })
      )
  }

  setUserData(userData: AuthResponseData, username: string, country: string, picture: string) {
    console.log("setUserData");
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(userData.localId, userData.email, username, country, picture, [], userData.idToken, expirationTime);
    this._user.next(user);

    this.autoLogout(user.tokenDuration);
    this.sendEmailVerification(userData.idToken).subscribe(email => {
      console.log("sendEmailVerification", email);
    });
    // this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    //TODO: Plugins itt mit jelent, működni fog?
    Plugins.Storage.set({key: 'authData', value: data})
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }
}
