import {Component, OnDestroy, OnInit} from '@angular/core';
import {GamesService} from './games.service';
import {Game} from "../models/game.model";
import {Subscription} from "rxjs";
import {map, take} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit, OnDestroy {

  loadedGames: Game[];
  isLoading = false;
  filter = '';
  private gamesSub: Subscription;

  constructor(private gamesService: GamesService, private authService: AuthService) { }

  ngOnInit() {
    this.gamesSub = this.gamesService.games.subscribe(games => {
      return this.authService.userId.pipe(take(1)).subscribe(userId => {
        this.loadedGames = games.filter(game => game.itIsPublic || game.userId === userId);
        console.log("games", this.loadedGames, this.loadedGames.length);
      });
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.gamesService.fetchGames().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.gamesSub) {
      this.gamesSub.unsubscribe();
    }
  }

}
