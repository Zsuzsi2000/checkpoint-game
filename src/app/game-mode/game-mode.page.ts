import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Game} from "../models/game.model";
import {Event} from "../models/event.model";
import {EventsService} from "../events/events.service";
import {GamesService} from "../games/games.service";
import {GameMode} from "../enums/GameMode";
import {AuthService} from "../auth/auth.service";
import {Subscription} from "rxjs";
import {User} from "../models/user.model";

@Component({
  selector: 'app-game-mode',
  templateUrl: './game-mode.page.html',
  styleUrls: ['./game-mode.page.scss'],
})
export class GameModePage implements OnInit, OnDestroy {

  game: Game;
  event: Event;
  user: User = null;
  gameMode: GameMode = GameMode.notSpecified;
  getGame = false;
  getEvent = false;
  userSub: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private eventsService: EventsService,
              private gamesService: GamesService,
              private authService: AuthService) { }

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) this.user = user;
    });
    if (this.activatedRoute.snapshot.queryParamMap.has('gameId')) {
      console.log(this.activatedRoute.snapshot.queryParamMap.get('gameId'));
      this.gamesService.fetchGame(this.activatedRoute.snapshot.queryParamMap.get('gameId')).subscribe(game => {
        this.game = game;
        this.getGame = true;
      });
    }
    if (this.activatedRoute.snapshot.queryParamMap.has('eventId')) {
      console.log(this.activatedRoute.snapshot.queryParamMap.get('eventId'));
      this.eventsService.fetchEvent(this.activatedRoute.snapshot.queryParamMap.get('eventId')).subscribe(event => {
        this.event = event;
        this.gameMode = this.event.liveGameSettings.gameMode;
        this.getEvent = true;
      });
    }

  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

}
