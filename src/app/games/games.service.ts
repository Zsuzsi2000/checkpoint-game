import {Injectable, OnInit} from '@angular/core';
import {Game} from "../models/game.model";
import {AuthService} from "../auth/auth.service";
import {filter, map, switchMap, take, tap} from "rxjs/operators";
import {BehaviorSubject, of} from "rxjs";
import {HttpClient} from "@angular/common/http";

interface GameData {
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {

    private _games = new BehaviorSubject<Game[]>([]);

  //   private _games = new BehaviorSubject<Game[]>([
  //   new Game(null, 'Demo game', 'Teszt Elek', 'Hungary',
  //     'Kiskunmajsa, Katona József u. 5, 6120', 'Music', true,
  //      "This is a long description of the game. There are many things that you don't know about the game",
  //     "https://daily.jstor.org/wp-content/uploads/2023/01/good_times_with_bad_music_1050x700.jpg", 3,
  //     2, false, '007'),
  //   new Game(null, 'Demo game 2', 'Teszt Elek', 'Hungary',
  //      "Szeged, Magyar Ede tér 2, 6720", 'Sport', false,
  //     "This is a long description of the game. There are many things that you don't know about the game",
  //     "https://csillaghegysport.hu/wp-content/uploads/2022/04/sport_picture.webp", 5,
  //     3, true, '007'),
  // ]);

  get games() {
    return this._games.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchGames() {
    return this.http.get<{[key: string]: GameData}>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games.json")
      .pipe(
        tap(resData => {
          console.log(resData);
        }),
        map(data => {
          const games = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              games.push(new Game(key, data[key].name, null, null, null,
                null, null, null, null, null, null, null, null))
            }
          }
          return games;
        }),
        tap(games => {
          this._games.next(games);
        })
      );
  }

  fetchGame(id: string) {
    return  this.http.get<GameData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games/${id}.json`).pipe(
      map( gameData => {
        return new Game(id, gameData.name, null, null, null,
          null, null, null, null, null, null, null, null );
      })
    );
  }


  getGame(id: string) {
    // {... wouldn't edit the original object
    return  this.games.pipe(
      take(1),
      map( games => {
        return {...games.find(game => game.id === id)};
      })
    );
  }

  addGame(name: string,
          country: string,
          pointOfDeparture: string,
          category: string,
          quiz: boolean,
          description: string,
          imgUrl: string,
          distance: number,
          duration: number,
          itIsPublic: boolean) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      //TODO: get az user name
      const creatorName = "Elena";
      const newGame =  new Game(null, name, creatorName, country, pointOfDeparture, category, quiz, description,
        imgUrl, distance, duration, itIsPublic, userId);
      this.games.pipe(take(1)).subscribe(games => {
        this._games.next(games.concat(newGame));
      })
    });

    // if we would like to simulate loading in the other side 192.lecke
    // return this.authService.userId.pipe(take(1), tap(userId => {
    //   const newGame =  new Game(id, name, creatorName, country, pointOfDeparture, category, quiz, description,
    //     imgUrl, distance, duration, userId);
    //   this.games.pipe(take(1)).subscribe(games => {
    //     this._games.next(games.concat(newGame));
    //   })
    // }));
  }

  updateGame(id: string,
             name: string,
             creatorName: string,
             country: string,
             pointOfDeparture: string,
             category: string,
             quiz: boolean,
             description: string,
             imgUrl: string,
             distance: number,
             duration: number,
             itIsPublic: boolean) {

    let updatedGames: Game[];
    return this.games.pipe(
      take(1),
      switchMap(games => {
        if (!games || games.length < 0) {
          return this.fetchGames();
        } else {
          return of(games); //switchmap has to return observable
        }
      }),
      switchMap(games => {
        const updatedGameIndex = games.findIndex(g => g.id === id);
        const updatedGames = [...games];
        const old = updatedGames[updatedGameIndex];
        updatedGames[updatedGameIndex] = new Game(old.id, name, creatorName, country,
          pointOfDeparture, category, quiz, description, imgUrl, distance, duration, itIsPublic, old.userId);
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games/${id}.json`,
          { ...updatedGames[updatedGameIndex], id: null }
        );
      }),
      tap(() => {
        this._games.next(updatedGames);
      })
    );

    // return this.games.pipe(take(1), tap(games => {
    //   const updatedGameIndex = games.findIndex(g => g.id === id);
    //   const updatedGames = [...games];
    //   const old = updatedGames[updatedGameIndex];
    //   updatedGames[updatedGameIndex] = new Game(old.id, name, creatorName, country,
    //     pointOfDeparture, category, quiz, description, imgUrl, distance, duration, itIsPublic, old.userId);
    //   this._games.next(updatedGames);
    // }));
  }

  deleteGame(id: string) {
    return this.games.pipe(
      take(1),
      tap(games => {
        this._games.next(games.filter(g => g.id !== id))
      })
    );
  }
}
