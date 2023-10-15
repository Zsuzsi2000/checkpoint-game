import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, from} from "rxjs";
import {User} from "../models/user.model";
import {map, take, tap} from "rxjs/operators";
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

  constructor(private http: HttpClient) {}

  autoLogin() {
    return from(Plugins.Storage.get({key: 'authData'})).pipe(
      map(storedData => {
        if (!storedData || !(storedData as {key: string; value: string}).value) {
          return null;
        }
        const parsedData = JSON.parse((storedData as {key: string; value: string}).value) as { userId: string; token: string; tokenExpirationDate: string; email: string};
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        return new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
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

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
        environment.firebaseAPIKey
      }`,
      { email, password, returnSecureToken: true }
    ).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    console.log("login", email, password);
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
        environment.firebaseAPIKey
      }`,
      { email, password, returnSecureToken: true }
    ).pipe(tap(resData => {
        if (resData.idToken) {
          this.getUserData(resData.idToken).subscribe(users => {
            console.log("users", users, users[0].emailVerified);
            const emailVerified = (users[0] && users[0].emailVerified) ? users[0].emailVerified : false;
            if (!emailVerified) {
              throw new Error("EMAIL_IS_NOT_VERIFIED");
            }
            this.setUserData.bind(this);
          })
        }
      })
    );
  }

  loginAsAGuest() {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
        environment.firebaseAPIKey
      }`,
      { returnSecureToken: true }
    );
  }

  sendPasswordResetEamil(email: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${
        environment.firebaseAPIKey
      }`,
      { requestType: 'PASSWORD_RESET', email }
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
      { idToken: token, email: newEmail, returnSecureToken: true }
    );
  }

  sendEmailVerification(token: string) {
    // const token = this.token.pipe(take(1)).subscribe(t => {
    //   return t;
    // });
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${
        environment.firebaseAPIKey
      }`,
      { requestType: 'VERIFY_EMAIL', idToken: token }
    );
  }

  getUserData(token: string) {
    return this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${
        environment.firebaseAPIKey
      }`,
      { idToken: token }
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
      { idToken: token }
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

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(userData.localId, userData.email, userData.idToken, expirationTime);
    this._user.next(user);

    this.autoLogout(user.tokenDuration);
    this.sendEmailVerification(userData.idToken).subscribe(email => {
      console.log("sendEmailVerification", email);
    });
    // this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  private storeAuthData(userId: string, token: string, tokenExpirationDate: string, email: string ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      email: email
    });
    //TODO: Plugins itt mit jelent, működni fog?
    Plugins.Storage.set({ key: 'authData', value: data })
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }
}
