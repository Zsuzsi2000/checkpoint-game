import { Component, OnInit } from '@angular/core';
import {GamesService} from './games.service';
import {Game} from "../models/game.model";

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {

  loadedGames: Game[];
  filter = '';

  constructor(private gamesService: GamesService) { }

  ngOnInit() {
    this.loadedGames = this.gamesService.games;
  }

}
