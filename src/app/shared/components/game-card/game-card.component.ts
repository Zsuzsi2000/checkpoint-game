import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from "../../../models/game.model";
import {User} from "../../../models/user.model";
import {UserData} from "../../../interfaces/UserData";
import {AlertController} from "@ionic/angular";
import {Router} from "@angular/router";
import {GamesService} from "../../../games/games.service";
import {LocationType} from "../../../enums/LocationType";

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {

  @Input() game!: Game;
  @Input() profile!: boolean;
  @Input() ownProfile!: boolean;
  @Input() loggedUser: User;
  @Input() loadedUser: UserData = null;
  @Output() updateGamesList = new EventEmitter<Game[]>();

  LocationType = LocationType;

  constructor(private alertCtrl: AlertController,
              private router: Router,
              private gamesService: GamesService) { }

  ngOnInit() {}

  editGame(id: string) {
    this.router.navigate(['/', 'games', 'edit-game', id]);
  }

  deleteGame(id: string) {
    this.alertCtrl.create({
      header: "Delete game",
      message: "Are you sure you want to delete the game?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => {
            this.gamesService.deleteGame(id).subscribe(res => {
              this.gamesService.fetchOwnGames(this.loadedUser.id).subscribe(games => {
                this.updateGamesList.emit(games);
                // this.loadedOwnGames = games;
              });
            });
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  createEvent(gameId: string) {
    this.router.navigate(['/', 'events', 'create-event'], {
      queryParams: { gameId: gameId }
    });
  }

}
