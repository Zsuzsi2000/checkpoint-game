import { Injectable } from '@angular/core';
import {BehaviorSubject, of} from "rxjs";
import {LiveGame} from "../models/liveGame";
import {map, switchMap, take, tap} from "rxjs/operators";
import {LiveGameSettings} from "../models/liveGameSettings";
import {PlayerModel} from "../models/player.model";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {CheckpointState} from "../interfaces/CheckpointState";

interface LiveGameData {
  gameId: string,
  event: boolean,
  eventId: string,
  liveGameSettings: LiveGameSettings,
  accessCode: string,
  startDate: Date,
}

interface PlayerData {
  liveGameId: string,
  teamName: string;
  teamMembers: {id: string, name: string}[];
  checkpointsState: CheckpointState[],
  score: number;
  duration: number;
  checkpointsDuration: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiveGameService {

  private _liveGames = new BehaviorSubject<LiveGame[]>([]);
  private _players = new BehaviorSubject<PlayerModel[]>([]);

  get liveGames() {
    return this._liveGames.asObservable();
  }

  get players() {
    return this._players.asObservable();
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
                data[key].event,
                data[key].eventId,
                data[key].liveGameSettings,
                data[key].accessCode,
                data[key].startDate ? data[key].startDate : null,
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
          liveGameData.event,
          liveGameData.eventId,
          liveGameData.liveGameSettings,
          liveGameData.accessCode,
          liveGameData.startDate ? liveGameData.startDate : null,
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

  updateLiveGame(liveGame: LiveGame) {
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

  fetchPlayers() {
    return this.http.get<{ [key: string]: PlayerData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/players.json")
      .pipe(
        map(data => {
          const players = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              players.push(new PlayerModel(
                key,
                data[key].liveGameId,
                data[key].teamName,
                data[key].teamMembers,
                data[key].checkpointsState,
                data[key].score,
                data[key].duration,
                data[key].checkpointsDuration,
              ))
            }
          }
          return players;
        }),
        tap(players => {
          this._players.next(players);
        })
      );
  }

  fetchPlayer(id: string) {
    return this.http.get<PlayerData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/players/${id}.json`).pipe(
      map(playerData => {
        return new PlayerModel(
          id,
          playerData.liveGameId,
          playerData.teamName,
          playerData.teamMembers,
          playerData.checkpointsState,
          playerData.score,
          playerData.duration,
          playerData.checkpointsDuration,
        );
      })
    );
  }

  createPlayer(player: PlayerModel) {
    let generatedId: string;
    let newPlayer = player;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ name: string }>(
          'https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/players.json',
          {...newPlayer, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        newPlayer.id = id;
        this._players.next([...this._players.getValue(), newPlayer]);
      })
    );
  }

  updatePlayer(player: PlayerModel) {
    let updatedPlayers: PlayerModel[];
    return this.players.pipe(
      take(1),
      switchMap(players => {
        if (!players || players.length < 0) {
          return this.fetchPlayers();
        } else {
          return of(players);
        }
      }),
      switchMap(players => {
        const updatedPlayerIndex = players.findIndex(l => l.id === player.id);
        updatedPlayers = [...players];
        updatedPlayers[updatedPlayerIndex] = player;
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/players/${player.id}.json`,
          {...updatedPlayers[updatedPlayerIndex], id: null}
        );
      }),
      tap(() => {
        this._players.next(updatedPlayers);
      })
    );
  }

  deletePlayer(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/players/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.players;
      }),
      take(1),
      tap(players => {
        this._players.next(players.filter(b => b.id !== id));
      })
    );
  }



}
