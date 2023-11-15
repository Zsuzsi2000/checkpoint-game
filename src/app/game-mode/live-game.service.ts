import { Injectable } from '@angular/core';
import {BehaviorSubject, of} from "rxjs";
import {Event} from "../models/event.model";
import {LiveGame} from "../models/liveGame";
import {map, switchMap, take, tap} from "rxjs/operators";
import {LiveGameSettings} from "../models/liveGameSettings";
import {Player} from "../interfaces/Player";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";

interface LiveGameData {
  gameId: string,
  liveGameSettings: LiveGameSettings,
  accessCode: string,
  startDate: Date,
  players: Player[],
}

@Injectable({
  providedIn: 'root'
})
export class LiveGameService {

  private _liveGames = new BehaviorSubject<LiveGame[]>([]);

  get liveGames() {
    return this._liveGames.asObservable();
  }

  constructor(private http: HttpClient, private authService: AuthService) { }

  fetchLiveGames() {
    return this.http.get<{ [key: string]: LiveGameData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/livegames.json")
      .pipe(
        map(data => {
          const liveGames = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              liveGames.push(new LiveGame(
                key,
                data[key].gameId,
                data[key].liveGameSettings,
                data[key].accessCode,
                data[key].startDate,
                data[key].players,
              ))
            }
          }
          return liveGames;
        }),
        tap(liveGames => {
          this._liveGames.next(liveGames);
        })
      );
  }

  fetchLiveGame(id: string) {
    return this.http.get<LiveGameData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/livegames/${id}.json`).pipe(
      map(liveGameData => {
        return new LiveGame(
          id,
          liveGameData.gameId,
          liveGameData.liveGameSettings,
          liveGameData.accessCode,
          liveGameData.startDate,
          liveGameData.players,
        );
      })
    );
  }

  createLiveGame(liveGame: LiveGame) {
    let generatedId: string;
    let newLiveGame = liveGame;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        console.log("newLiveGame", newLiveGame);
        return this.http.post<{ name: string }>(
          'https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/livegames.json',
          {...newLiveGame, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        newLiveGame.id = id;
        this._liveGames.next([...this._liveGames.getValue(), newLiveGame]);
      })
    );
  }

  updateEvent(liveGame: LiveGame) {
    let updatedLiveGames: LiveGame[];
    return this.liveGames.pipe(
      take(1),
      switchMap(liveGames => {
        if (!liveGames || liveGames.length < 0) {
          return this.fetchLiveGames();
        } else {
          return of(liveGames);
        }
      }),
      switchMap(liveGames => {
        const updatedLiveGameIndex = liveGames.findIndex(l => l.id === liveGame.id);
        updatedLiveGames = [...liveGames];
        updatedLiveGames[updatedLiveGameIndex] = liveGame;
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/livegames/${liveGame.id}.json`,
          {...updatedLiveGames[updatedLiveGameIndex], id: null}
        );
      }),
      tap(() => {
        this._liveGames.next(updatedLiveGames);
      })
    );
  }

  deleteLiveGame(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/livegames/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.liveGames;
      }),
      take(1),
      tap(liveGames => {
        this._liveGames.next(liveGames.filter(b => b.id !== id));
      })
    );
  }


}
