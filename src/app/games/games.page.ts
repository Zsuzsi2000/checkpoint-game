import {Component, OnDestroy, OnInit} from '@angular/core';
import {GamesService} from './games.service';
import {Game} from "../models/game.model";
import {forkJoin, of, Subscription} from "rxjs";
import {map, take} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";
import {UserService} from "../services/user.service";
import {Checkpoint} from "../models/checkpoint.model";

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit, OnDestroy {

  favouriteGames: string[] = [];
  loadedGames: Game[] = [];
  isLoading = false;
  filter = '';
  private gamesSub: Subscription;
  private favouritesSub: Subscription;

  constructor(private gamesService: GamesService,
              private authService: AuthService,
              private userService: UserService) { }

  ngOnInit() {
    this.gamesSub = this.gamesService.games.subscribe(games => {
      return this.authService.userId.pipe(take(1)).subscribe(userId => {
        this.loadedGames = games.filter(game => game.itIsPublic || game.userId === userId);
        console.log("games", this.loadedGames, this.loadedGames.length);
      });
    });

    this.favouritesSub = this.authService.user.subscribe(user => {
      console.log("user", user);
      if (user) {
        this.favouriteGames = user.favouriteGames;
      }
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.gamesService.fetchGames().subscribe(() => {
      this.isLoading = false;
    });
  }

  addToFavourites(gameId: string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      //TODO: delete this pictureUrl
      this.userService.updateUser(
        userId,
        null,
        null,
        "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
        gameId,
        true
      ).pipe(take(1)).subscribe();
    });
  }

  deleteFromFavourites(gameId: string) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      //TODO: delete this pictureUrl
      this.userService.updateUser(
        userId,
        null,
        null,
        "https://highlysensitiverefuge.com/wp-content/uploads/2019/12/highly-sensitive-person-signs.jpeg",
        gameId,
        false
      ).pipe(take(1)).subscribe();
    });
  }

  checkIsItFavourite(id: string): boolean {
    return this.favouriteGames.includes(id);
  }

  ngOnDestroy(): void {
    if (this.gamesSub) {
      this.gamesSub.unsubscribe();
    }
    if (this.favouritesSub) {
      this.favouritesSub.unsubscribe();
    }
  }

}
