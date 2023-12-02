import {Component, OnDestroy, OnInit} from '@angular/core';
import {GamesService} from './games.service';
import {Game} from "../models/game.model";
import {combineLatest, Subscription} from "rxjs";
import {take} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";
import {LocationType} from "../enums/LocationType";
import {SortingMode} from "../enums/SortingMode";
import {FilteringMode} from "../enums/FilteringMode";
import {AlertController, ModalController} from "@ionic/angular";
import {CountryService} from "../services/country.service";
import {PickThingsComponent} from "../shared/components/pick-things/pick-things.component";
import {User} from "../models/user.model";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit, OnDestroy {

  loadedGames: Game[] = [];
  actualGames: Game[] = [];
  sortingMode = false;
  filteringMode = false;
  isLoading = false;
  filter = '';
  filters: string[] = [];
  filtersObject: {
    countries: string[],
    categories: string[],
    types: string[],
    favourites: string[],
    ownCountry: string
  };
  user: User;

  actualSortingMode: SortingMode = null;
  LocationType = LocationType;
  SortingMode = SortingMode;
  FilteringMode = FilteringMode;
  descending = true;
  categories: { id: string, name: string }[];
  countries: string[] = [];
  types: string[] = ["Quiz", "Learning"];
  currentLanguage = "";
  private gamesSub: Subscription;

  constructor(private gamesService: GamesService,
              private authService: AuthService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private router: Router,
              private translate: TranslateService,
              private countryService: CountryService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
    this.filtersObject = {
      countries: [],
      categories: [],
      types: [],
      favourites: [],
      ownCountry: null
    };

    this.gamesSub = combineLatest([
      this.gamesService.games,
      this.authService.user
    ]).subscribe(([games, user]) => {
      if (user) {
        this.user = user;
        this.loadedGames = games.filter(game => game.itIsPublic || game.userId === user.id);
        this.actualGames = this.loadedGames;
        this.filtersObject.favourites = this.filters.includes("Favourites") ? this.user.favouriteGames : [];
        this.filtersObject.ownCountry = this.filters.includes("Own country") ? this.user.country : null;
        this.filterGames();
      } else {
        this.user = null;
        this.loadedGames = games.filter(game => game.itIsPublic);
        this.actualGames = this.loadedGames;
        this.deleteFilter("Favourites");
        this.deleteFilter("Own country");
      }
    });

    this.gamesService.fetchCategories().pipe(take(1)).subscribe(categories => {
      if (categories) {
        this.categories = categories;
      }
    });

    this.countryService.fetchCountries().subscribe(countries => {
      if (countries) this.countries = countries;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.gamesService.fetchGames().subscribe(() => {
      this.isLoading = false;
    });
  }

  toggleSorting() {
    this.sortingMode = !this.sortingMode;
    if (!this.sortingMode) {
      this.actualSortingMode = null;
    }
  }

  toggleDescending() {
    this.descending = !this.descending;
    if (this.actualSortingMode !== null) {
      this.sortGames();
    }
  }

  toggleFiltering() {
    this.filteringMode = !this.filteringMode;
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
        this.actualGames = this.actualGames.sort((a, b) =>  a.creationDate < b.creationDate ? first : (a.creationDate > b.creationDate ? second : 0));
        break;
      }
      case SortingMode.byPopularity: {
        this.actualGames = this.actualGames.sort((a, b) =>  a.numberOfAttempts < b.numberOfAttempts ? first : (a.numberOfAttempts > b.numberOfAttempts ? second : 0));
        break;
      }
      case SortingMode.byGameName: {
        this.actualGames = this.actualGames.sort((a, b) =>  a.name < b.name ? first : (a.name > b.name ? second : 0));
        break;
      }
    }
  }

  deleteFilter(item: string) {
    if (item === "Favourites") {
      this.filtersObject.favourites = [];
    } else if (item === "Own country") {
      this.filtersObject.ownCountry = null;
    } else {
      this.filtersObject.countries = this.filtersObject.countries.filter(c =>  c !== item );
      this.filtersObject.categories = this.filtersObject.categories.filter(c =>  c !== item );
      this.filtersObject.types = this.filtersObject.types.filter(t =>  t !== item );
    }
    this.filterGames();
  }

  openModal(mode: FilteringMode, title: string, things: string[], pickedThings: string[]) {
    this.modalCtrl.create({ component: PickThingsComponent, componentProps: {
        title: title,
        things: things,
        pickedThings: pickedThings
      }}).then(modalEl => {
      modalEl.onDidDismiss().then(modal => {
        if (modal.data) {
          switch (mode) {
            case FilteringMode.byCategories: {
              this.filtersObject.categories = modal.data;
              break;
            }
            case FilteringMode.byCountries: {
              this.filtersObject.countries = modal.data;
              break;
            }
            case FilteringMode.byTypes: {
              this.filtersObject.types = modal.data;
              break;
            }
          }
          this.filterGames();
        }
      });
      modalEl.present();
    })
  }

  startFilter(mode: FilteringMode) {
    switch (mode) {
      case FilteringMode.byCategories: {
        this.openModal(mode,'Choose from categories', this.categories.map(cat => { return cat.name }), this.filtersObject.categories );
        break;
      }
      case FilteringMode.byCountries: {
        this.openModal(mode,'Choose from countries', this.countries, this.filtersObject.countries );
        break;
      }
      case FilteringMode.byTypes: {
        this.openModal(mode,'Choose from types', this.types, this.filtersObject.types );
        break;
      }
      case FilteringMode.byFavourites: {
        this.filtersObject.favourites = this.user.favouriteGames;
        this.filterGames();
        break;
      }
      case FilteringMode.byOwnCountry: {
        this.filtersObject.ownCountry = this.user.country;
        this.filterGames();
        break;
      }
    }
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filterGames();
  }

  filterGames() {
    this.actualGames = this.loadedGames
      .filter(g => (this.filtersObject.categories.length > 0) ? this.filtersObject.categories.includes(g.category) : g)
      .filter(g => (this.filtersObject.countries.length > 0)
        ? (this.filtersObject.countries.includes(g.country) || (this.filtersObject.countries.includes("Anywhere") && g.locationType === LocationType.anywhere)) : g)
      .filter(g => (this.filtersObject.types.length > 0) ? this.filtersObject.types.includes((g.quiz) ? "Quiz" : "Learning") : g)
      .filter(g => (this.filtersObject.favourites.length > 0) ? this.filtersObject.favourites.includes(g.id) : g)
      .filter(g => (this.filtersObject.ownCountry) ? this.filtersObject.ownCountry === g.country : g)
      .filter(g => this.filter === "" ? g : g.name.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));

    this.updateFilters();
    this.sortGames();
  }

  updateFilters() {
    this.filters = [];
    this.filters = this.filtersObject.countries.concat(
      this.filtersObject.categories,
      this.filtersObject.types,
      (this.filtersObject.favourites.length > 0) ? ["Favourites"] : [],
      (this.filtersObject.ownCountry !== null) ? ["Own country"] : []);
  }

  ngOnDestroy(): void {
    if (this.gamesSub) {
      this.gamesSub.unsubscribe();
    }
  }

}
