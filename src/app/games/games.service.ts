import { Injectable } from '@angular/core';
import {Game} from "../models/game.model";

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private _games: Game[] = [
    new Game('aaaaa', 'Demo game', 'Teszt Elek', 'Hungary',
      'Kiskunmajsa, Katona József u. 5, 6120', 'Music', true,
       "This is a long description of the game. There are many things that you don't know about the game",
      "https://daily.jstor.org/wp-content/uploads/2023/01/good_times_with_bad_music_1050x700.jpg", 3,
      2),
    new Game('aaaab', 'Demo game 2', 'Teszt Elek', 'Hungary',
       "Szeged, Magyar Ede tér 2, 6720", 'Sport', false,
      "This is a long description of the game. There are many things that you don't know about the game",
      "https://csillaghegysport.hu/wp-content/uploads/2022/04/sport_picture.webp", 5,
      3),
  ];

  get games() {
    return [...this._games];
  }

  constructor() { }

  addGame() {

  }

  getGame(id: string) {
    // {... wouldn't edit the original object
    return {...this._games.find(game => game.id === id)};
  }
}
