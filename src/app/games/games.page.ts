import {Component, OnDestroy, OnInit} from '@angular/core';
import {GamesService} from './games.service';
import {Game} from "../models/game.model";
import {Subscription} from "rxjs";
import {take} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

import {LocationType} from "../enums/LocationType";
import {SortingMode} from "../enums/SortingMode";

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit, OnDestroy {

  loadedGames: Game[] = [];
  filteredGames: Game[] = [];
  sortedGames: Game[] = [];
  actualGames: Game[] = [];
  sortingMode = false;
  isLoading = false;
  filter = '';
  userId: string;
  actualSortingMode: SortingMode = null;
  LocationType = LocationType;
  SortingMode = SortingMode;
  descending = true;
  private gamesSub: Subscription;

  constructor(private gamesService: GamesService,
              private authService: AuthService) { }

  ngOnInit() {
    this.gamesSub = this.gamesService.games.subscribe(games => {
      return this.authService.userId.pipe(take(1)).subscribe(userId => {
        this.userId = userId;
        if (userId) {
          this.loadedGames = games.filter(game => game.itIsPublic || game.userId === userId);
          this.actualGames = this.loadedGames;
        } else {
          this.loadedGames = games.filter(game => game.itIsPublic);
          this.actualGames = this.loadedGames;
        }
      });
    });
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

  toggleSorting() {
    this.sortingMode = !this.sortingMode;
    if (!this.sortingMode) {
      this.actualSortingMode = null;
      this.sortedGames = this.loadedGames;
      this.actualGames = this.loadedGames;
    }
  }

  toggleDescending() {
    this.descending = !this.descending;
    if (this.actualSortingMode !== null) {
      this.sortGames();
    }
  }

  sortGamesEvent(event) {
    this.actualSortingMode = event.detail.value;
    this.sortGames()
  }

  sortGames() {
    const first = (this.descending) ? -1 : 1;
    const second = (this.descending) ? 1 : -1;
    switch (this.actualSortingMode) {
      case SortingMode.byCreationDate: {
        this.sortedGames = this.loadedGames.sort((a, b) =>  a.creationDate < b.creationDate ? first : (a.creationDate > b.creationDate ? second : 0));
        break;
      }
      case SortingMode.byPopularity: {
        this.sortedGames = this.loadedGames.sort((a, b) =>  a.numberOfAttempts < b.numberOfAttempts ? first : (a.numberOfAttempts > b.numberOfAttempts ? second : 0));
        break;
      }
      case SortingMode.byGameName: {
        this.sortedGames = this.loadedGames.sort((a, b) =>  a.name < b.name ? first : (a.name > b.name ? second : 0));
        break;
      }
    }
    this.actualGames = this.sortedGames;
  }

  toggleFiltering() {

  }

}
