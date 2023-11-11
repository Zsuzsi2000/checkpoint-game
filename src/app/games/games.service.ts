import {Injectable, OnInit} from '@angular/core';
import {Game} from "../models/game.model";
import {AuthService} from "../auth/auth.service";
import {map, switchMap, take, tap} from "rxjs/operators";
import {BehaviorSubject, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Checkpoint} from "../models/checkpoint.model";
import {UserService} from "../services/user.service";
import {Location} from "../interfaces/Location";
import {LocationIdentification} from "../enums/LocationIdentification";
import {LocationType} from "../enums/LocationType";

interface GameData {
  name: string;
  category: string;
  description: string;
  quiz: boolean;
  locationType: LocationType;
  locationIdentification: LocationIdentification;
  creatorName: string;
  country: string;
  pointOfDeparture: Location;
  imgUrl: string;
  numberOfAttempts: number;
  distance: number;
  duration: number;
  creationDate: Date;
  itIsPublic: boolean;
  checkpoints: Checkpoint[];
  ratings: string[];
  userId: string;
  mapUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private _games = new BehaviorSubject<Game[]>([]);
  private _categories = new BehaviorSubject<{ id: string, name: string }[]>([]);

  get games() {
    return this._games.asObservable();
  }

  get categories() {
    return this._categories.asObservable();
  }

  constructor(private authService: AuthService, private userService: UserService, private http: HttpClient) {
  }

  fetchGames() {
    return this.http.get<{ [key: string]: GameData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games.json")
      .pipe(
        map(data => {
          const games = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              games.push(new Game(
                key,
                data[key].name,
                data[key].creatorName,
                data[key].locationType,
                data[key].locationIdentification,
                data[key].country,
                data[key].pointOfDeparture,
                data[key].category,
                data[key].quiz,
                data[key].description,
                data[key].imgUrl,
                data[key].distance,
                data[key].duration,
                data[key].itIsPublic,
                data[key].userId,
                data[key].mapUrl,
                data[key].checkpoints,
                data[key].numberOfAttempts,
                data[key].creationDate,
                (data[key].ratings) ? data[key].ratings : []
              ))
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
    return this.http.get<GameData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games/${id}.json`).pipe(
      map(gameData => {
        return new Game(
          id,
          gameData.name,
          gameData.creatorName,
          gameData.locationType,
          gameData.locationIdentification,
          gameData.country,
          gameData.pointOfDeparture,
          gameData.category,
          gameData.quiz,
          gameData.description,
          gameData.imgUrl,
          gameData.distance,
          gameData.duration,
          gameData.itIsPublic,
          gameData.userId,
          gameData.mapUrl,
          gameData.checkpoints,
          gameData.numberOfAttempts,
          gameData.creationDate,
          (gameData.ratings) ? gameData.ratings : []
        );
      })
    );
  }

  createGame(name: string,
             locationType: LocationType,
             locationIdentification: LocationIdentification,
             country: string,
             pointOfDeparture: Location,
             category: string,
             quiz: boolean,
             description: string,
             imgUrl: string,
             distance: number,
             duration: number,
             itIsPublic: boolean,
             mapUrl: string,
             checkpoints: Checkpoint[]) {

    let generatedId: string;
    let fetchedUserId: string;
    let fetchedUserName: string;
    let newGame: Game;

    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        fetchedUserId = user.id;
        fetchedUserName = user.username;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newGame = new Game(
          null,
          name,
          fetchedUserName,
          locationType,
          locationIdentification,
          country,
          pointOfDeparture,
          category,
          quiz,
          description,
          imgUrl,
          distance,
          duration,
          itIsPublic,
          fetchedUserId,
          mapUrl,
          checkpoints);

        console.log("newGame", newGame);
        return this.http.post<{ name: string }>(
          'https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games.json',
          {...newGame, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        newGame.id = id;
        this._games.next([...this._games.getValue(), newGame]);
      })
    );

  }

  updateGame(id: string,
             name: string,
             locationType: LocationType,
             locationIdentification: LocationIdentification,
             country: string,
             pointOfDeparture: Location,
             category: string,
             quiz: boolean,
             description: string,
             imgUrl: string,
             distance: number,
             duration: number,
             itIsPublic: boolean,
             mapUrl: string,
             checkpoints: Checkpoint[],
             numberOfAttempts: number,
             creationDate: Date,
             ratings: string[]) {

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
        updatedGames = [...games];
        const old = updatedGames[updatedGameIndex];
        updatedGames[updatedGameIndex] = new Game(old.id, name, updatedGames[updatedGameIndex].creatorName, locationType, locationIdentification, country,
          pointOfDeparture, category, quiz, description, imgUrl, distance, duration, itIsPublic, old.userId, mapUrl, checkpoints, numberOfAttempts, creationDate, ratings);
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games/${id}.json`,
          {...updatedGames[updatedGameIndex], id: null}
        );
      }),
      tap(() => {
        this._games.next(updatedGames);
      })
    );
  }

  fetchOwnGames(id: string) {
    let fetchedUserId: string;
    return this.userService.getUserById(id).pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not found!');
        }
        fetchedUserId = user.id;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: GameData }>(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      take(1),
      map(data => {
        const games = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            games.push(new Game(
              key,
              data[key].name,
              data[key].creatorName,
              data[key].locationType,
              data[key].locationIdentification,
              data[key].country,
              data[key].pointOfDeparture,
              data[key].category,
              data[key].quiz,
              data[key].description,
              data[key].imgUrl,
              data[key].distance,
              data[key].duration,
              data[key].itIsPublic,
              data[key].userId,
              data[key].mapUrl,
              data[key].checkpoints,
              data[key].numberOfAttempts,
              data[key].creationDate,
              (data[key].ratings) ? data[key].ratings : []
            ))
          }
        }
        return games;
      })
    );
  }

  deleteGame(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/games/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.games;
      }),
      take(1),
      tap(games => {
        this._games.next(games.filter(b => b.id !== id));
      })
    );
  }

  fetchCategories() {
    return this.http.get<{ [key: string]: GameData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/categories.json")
      .pipe(
        map(data => {
          const categories = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              categories.push({id: key, name: data[key].name});
            }
          }
          return categories;
        }),
        tap(categories => {
          this._categories.next(categories);
        })
      );
  }

  createCategory(newCat: string) {
    let generatedId: string;
    return this.http.post<{ name: string }>('https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/categories.json',
      {name: newCat})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.categories;
        }),
        take(1),
        tap(categories => {
          this._categories.next(categories.concat({id: generatedId, name: newCat}));
        })
      );
  }

  deleteCategory(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/categories/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.categories;
      }),
      take(1),
      tap(categories => {
        this._categories.next(categories.filter(b => b.id !== id));
      })
    );
  }
}
