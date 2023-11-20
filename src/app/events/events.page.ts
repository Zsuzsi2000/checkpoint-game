import {Component, OnInit} from '@angular/core';
import {User} from "../models/user.model";
import {Event} from "../models/event.model";
import {combineLatest, forkJoin, of, Subscription} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {AlertController, ModalController} from "@ionic/angular";
import {CountryService} from "../services/country.service";
import {catchError, map, switchMap, take} from "rxjs/operators";
import {PickThingsComponent} from "../shared/components/pick-things/pick-things.component";
import {SortingMode} from "../enums/SortingMode";
import {FilteringMode} from "../enums/FilteringMode";
import {EventsService} from "./events.service";
import {GamesService} from "../games/games.service";
import {Game} from "../models/game.model";
import {LocationType} from "../enums/LocationType";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  loadedEvents: { event: Event, game: Game }[] = [];
  actualEvents: { event: Event, game: Game }[] = [];
  sortingMode = false;
  filteringMode = false;
  isLoading = false;
  filter = "";
  filters: string[] = [];
  filtersObject: {
    countries: string[],
    categories: string[],
    types: string[],
    favourites: string[],
    ownCountry: string,
    saved: string[]
  };
  user: User;

  actualSortingMode: SortingMode = null;
  SortingMode = SortingMode;
  FilteringMode = FilteringMode;
  descending = true;
  categories: { id: string, name: string }[];
  countries: string[] = [];
  types: string[] = ["Quiz", "Learning"];
  private eventsSub: Subscription;

  constructor(private eventService: EventsService,
              private gamesService: GamesService,
              private authService: AuthService,
              private userService: UserService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private countryService: CountryService) { }

  ngOnInit() {
    this.filtersObject = {
      countries: [],
      categories: [],
      types: [],
      favourites: [],
      ownCountry: null,
      saved: []
    };

    this.eventsSub = combineLatest([
      this.eventService.events,
      this.authService.user
    ]).subscribe(([events, user]) => {
      this.getGames(events).subscribe(data => {
        this.loadedEvents = data.filter(event => !((new Date(event.event.date)).getTime() < (new Date()).getTime()) );
        if (user) {
          this.user = user;
          this.loadedEvents = this.loadedEvents
            .filter(event => event.event.isItPublic || event.event.creatorId === user.id);
          this.actualEvents = this.loadedEvents;
          this.filtersObject.favourites = this.filters.includes("Favourites") ? this.user.favouriteGames : [];
          this.filtersObject.favourites = this.filters.includes("Saved") ? this.user.savedEvents : [];
          this.filtersObject.ownCountry = this.filters.includes("Own country") ? this.user.country : null;
          this.filterGames();
        } else {
          this.user = null;
          this.loadedEvents = this.loadedEvents.filter(event => event.event.isItPublic);
          this.actualEvents = this.loadedEvents;
          this.deleteFilter("Favourites");
          this.deleteFilter("Saved");
          this.deleteFilter("Own country");
        }
      });
    });

    this.gamesService.fetchCategories().pipe(take(1)).subscribe(categories => {
      if (categories) {
        this.categories = categories;
      }
    });

    this.countryService.fetchCountries().subscribe(countries => {
      if (countries) this.countries = countries;
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.eventService.fetchEvents().subscribe(() => {
      this.isLoading = false;
    });
  }

  getGames(events: Event[]) {
    let complex: { event: Event, game: Game }[] = [];
    const observables = [];
    events.forEach(event => {
      observables.push(this.gamesService.fetchGame(event.gameId).pipe(
        catchError((error) => {
          console.log(error);
          return of({ event: event, game: null });
        }),
        switchMap(game => {
          console.log(game);
          return of({ event: event, game: game });
        })
      ))
    });

    return (observables.length > 0)
      ? (forkJoin(observables).pipe(
        map((data: { event: Event, game: Game }[]) => {
          console.log(data);
          return data;
        })
      ))
      : of(events.map(event => {
        return ({ event: event, game: null });
      }));
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
      this.sortEvents();
    }
  }

  toggleFiltering() {
    this.filteringMode = !this.filteringMode;
  }

  sortEventsEvent(event) {
    this.actualSortingMode = event.detail.value;
    this.sortEvents()
  }

  sortEvents() {
    const first = (this.descending) ? -1 : 1;
    const second = (this.descending) ? 1 : -1;
    switch (this.actualSortingMode) {
      case SortingMode.byCreationDate: {
        this.actualEvents = this.actualEvents.sort((a, b) =>  a.event.creationDate < b.event.creationDate ? first : (a.event.creationDate > b.event.creationDate ? second : 0));
        break;
      }
      case SortingMode.byPopularity: {
        this.actualEvents = this.actualEvents.sort((a, b) =>  a.event.players.length < b.event.players.length ? first : (a.event.players.length > b.event.players.length ? second : 0));
        break;
      }
      case SortingMode.byGameName: {
        this.actualEvents = this.actualEvents.sort((a, b) =>  a.event.name < b.event.name ? first : (a.event.name > b.event.name ? second : 0));
        break;
      }
      case SortingMode.byDate: {
        this.actualEvents = this.actualEvents.sort((a, b) =>  a.event.date < b.event.date ? first : (a.event.date > b.event.date ? second : 0));
        break;
      }
    }
  }

  deleteFilter(item: string) {
    if (item === "Favourites") {
      this.filtersObject.favourites = [];
    } else if (item === "Saved") {
      this.filtersObject.saved = [];
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
          console.log("selected", modal.data);
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
      case FilteringMode.bySaved: {
        this.filtersObject.saved = this.user.savedEvents;
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
    this.actualEvents = this.loadedEvents
      .filter(g => (this.filtersObject.categories.length > 0) ? this.filtersObject.categories.includes(g.game.category) : g)
      .filter(g => (this.filtersObject.countries.length > 0)
        ? (this.filtersObject.countries.includes(g.game.country) || (this.filtersObject.countries.includes("Anywhere") && g.game.locationType === LocationType.anywhere)) : g)
      .filter(g => (this.filtersObject.types.length > 0) ? this.filtersObject.types.includes((g.game.quiz) ? "Quiz" : "Learning") : g)
      .filter(g => (this.filtersObject.favourites.length > 0) ? this.filtersObject.favourites.includes(g.game.id) : g)
      .filter(g => (this.filtersObject.saved.length > 0) ? this.filtersObject.saved.includes(g.event.id) : g)
      .filter(g => (this.filtersObject.ownCountry) ? this.filtersObject.ownCountry === g.game.country : g)
      .filter(g => this.filter === "" ? g : g.event.name.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
    this.updateFilters();
    this.sortEvents();
  }

  updateFilters() {
    this.filters = [];
    this.filters = this.filtersObject.countries.concat(
      this.filtersObject.categories,
      this.filtersObject.types,
      (this.filtersObject.favourites.length > 0) ? ["Favourites"] : [],
      (this.filtersObject.saved.length > 0) ? ["Saved"] : [],
      (this.filtersObject.ownCountry !== null) ? ["Own country"] : []);

    console.log(this.filters, this.filtersObject);
  }

  showAlert(header: string, message: string) {
    this.alertCtrl.create(
        {
          header: header,
          message: message,
          buttons: ['Okay']
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  ngOnDestroy(): void {
    if (this.eventsSub) {
      this.eventsSub.unsubscribe();
    }
  }

}
