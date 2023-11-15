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
import {LiveGameSettings} from "../models/liveGameSettings";
import {LiveGame} from "../models/liveGame";
import {CheckpointState} from "../interfaces/CheckpointState";
import {Player} from "../interfaces/Player";

@Component({
  selector: 'app-game-mode',
  templateUrl: './game-mode.page.html',
  styleUrls: ['./game-mode.page.scss'],
})
export class GameModePage implements OnInit, OnDestroy {

  game: Game;
  event: Event;
  user: User = null;
  liveGame: LiveGame;
  gameMode: GameMode = GameMode.notSpecified;
  getGame = false;
  getEvent = false;
  userSub: Subscription;
  liveGameSettings: LiveGameSettings;
  GameMode = GameMode;
  creatingLiveGameSetting = false;

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

  setSolo() {
    this.gameMode = GameMode.solo;
    let accessCode = Math.random().toString(16).slice(7);
    console.log(accessCode);
    let checkpointStates: CheckpointState[] = [];
    for (let i = 0; i++; i< this.game.checkpoints.length) {
      checkpointStates.push({
        checkIndex: i,
        done: false,
        correctAnswer: null,
        useHelp: null,
        startTimestap: null,
        endTimestap: null
      })
    }
    let players: Player[] = [{
      teamName: this.user.username,
      teamMembers: [{id: this.user.id, name: this.user.username}],
      score: 0,
      duration: null,
      checkpointsState: checkpointStates
    }];

    this.liveGame = new LiveGame(
      null,
      this.game.id,
      new LiveGameSettings(this.gameMode,1, 1),
      accessCode,
      new Date(),
      players
    )
  }

  createMultiplayer() {
    this.creatingLiveGameSetting = true;
  }

  setLiveGameSettings(event) {
    console.log(event);
    this.creatingLiveGameSetting = false;
    this.liveGameSettings = event;
  }


  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

}
