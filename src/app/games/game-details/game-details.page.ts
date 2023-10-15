import { Component, OnInit } from '@angular/core';
import {Game} from "../../models/game.model";
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {GamesService} from "../games.service";

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
})
export class GameDetailsPage implements OnInit {

  game: Game;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private gamesService: GamesService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      }
      this.game = this.gamesService.getGame(paramMap.get('gameId'));
    })
  }

}
