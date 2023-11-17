import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LiveGameService} from "../live-game.service";
import {AlertController, NavController} from "@ionic/angular";
import {Player} from "../../models/Player";
import {take} from "rxjs/operators";
import {GamesService} from "../../games/games.service";
import {Game} from "../../models/game.model";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-end',
  templateUrl: './end.page.html',
  styleUrls: ['./end.page.scss'],
})
export class EndPage implements OnInit {

  liveGameId: string;
  playerId: string;
  isLoading = true;
  game: Game;
  players: Player[] = [];
  player: Player;
  userName: string;
  sortType = "Score";

  constructor(private activatedRoute: ActivatedRoute,
              private liveGameService: LiveGameService,
              private navCtrl: NavController,
              private router: Router,
              private gameService: GamesService,
              private alertController: AlertController,
              private authService: AuthService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('liveGame')) {
        this.navCtrl.pop();
        return;
      }
      this.liveGameId = paramMap.get('liveGame');
      if (this.activatedRoute.snapshot.queryParamMap.has('playerId')) {
        this.playerId = this.activatedRoute.snapshot.queryParamMap.get('playerId');
      }
      this.liveGameService.fetchPlayers().pipe(take(1)).subscribe(players => {
        players.forEach((player: Player) => {
          if (player.liveGameId === this.liveGameId) {
            this.players.push(player);
            if (player.id === this.playerId) {
              this.player = player;
            }
          }
        });
        this.isLoading = false;
      });
      this.liveGameService.fetchLiveGame(this.liveGameId).pipe(take(1)).subscribe(liveGame => {
        if (liveGame) {
          this.gameService.fetchGame(liveGame.gameId).pipe(take(1)).subscribe(game => {
            if (game) {
              this.game = game;
              this.authService.user.pipe(take(1)).subscribe(user => {
                if (user) {
                  this.userName = user.username;
                  this.gameService.updateGame(this.game.id, this.game.name, this.game.locationType, this.game.locationIdentification,
                    this.game.country, this.game.pointOfDeparture, this.game.category, this.game.quiz, this.game.description,
                    this.game.imgUrl, this.game.distance, this.game.duration, this.game.itIsPublic, this.game.mapUrl,
                    this.game.checkpoints, this.game.numberOfAttempts + 1, this.game.creationDate, this.game.ratings).pipe(take(1)).subscribe(c => console.log(c));
                }
              })
            }
          })
        }
      });
    });
  }

  sort(event) {
    console.log(event.detail.value);
    this.sortType = event.detail.value;
    if (event.detail.value === "Score") {
      this.players = this.players.sort((a, b) =>  a.score < b.score ? -1 : (a.score > b.score ? 1 : 0));
    } else if (event.detail.value === "BigDuration") {
      this.players = this.players.sort((a, b) =>  a.duration < b.duration ? -1 : (a.duration > b.duration ? 1 : 0));
    } else {
      this.players = this.players.sort((a, b) =>  a.checkpointsDuration < b.checkpointsDuration ? -1 : (a.checkpointsDuration > b.checkpointsDuration ? 1 : 0));
    }
  }

  backToMenu() {
    this.players.forEach(player => {
      this.liveGameService.deletePlayer(player.id).subscribe(d => {
        console.log(d);
      });
    });

    this.liveGameService.deleteLiveGame(this.liveGameId).subscribe(d => {
      console.log(d);
      this.router.navigate(['/', 'games']);
    });

  }

  addRating() {
    this.alertController.create({
      header: "Give a rating or write your opinion",
      inputs: [{
        placeholder: "Rating",
        type: "text",
        name: "rating",
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Go",
          handler: (event) => {
            console.log(event.rating);
            if (this.game.ratings) {
              this.game.ratings.push({ username: this.userName, text: event.rating });
            } else {
              this.game.ratings = [{ username: this.userName, text: event.rating }];
            }

            this.gameService.updateGame(this.game.id, this.game.name, this.game.locationType, this.game.locationIdentification,
              this.game.country, this.game.pointOfDeparture, this.game.category, this.game.quiz, this.game.description,
              this.game.imgUrl, this.game.distance, this.game.duration, this.game.itIsPublic, this.game.mapUrl,
              this.game.checkpoints, this.game.numberOfAttempts, this.game.creationDate, this.game.ratings).pipe(take(1)).subscribe(c => console.log(c));
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  ngOnDestroy(): void {
      this.players.forEach(player => {
        this.liveGameService.deletePlayer(player.id).subscribe(d => {
          console.log(d);
        });
      });

      this.liveGameService.deleteLiveGame(this.liveGameId).subscribe(d => {
        console.log(d);
      });
  }

}
