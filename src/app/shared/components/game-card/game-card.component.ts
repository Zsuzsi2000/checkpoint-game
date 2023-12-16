import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Game} from "../../../models/game.model";
import {User} from "../../../models/user.model";
import {UserData} from "../../../interfaces/UserData";
import {AlertController, ModalController} from "@ionic/angular";
import {Router} from "@angular/router";
import {GamesService} from "../../../games/games.service";
import {LocationType} from "../../../enums/LocationType";
import {ShareComponent} from "../share/share.component";
import {TranslateService} from "@ngx-translate/core";

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
              private gamesService: GamesService,
              private modalCtrl: ModalController,
              private translate: TranslateService) { }

  ngOnInit() {}

  editGame(id: string) {
    this.router.navigate(['/', 'games', 'edit-game', id]);
  }

  deleteGame(id: string) {
    this.alertCtrl.create({
      header: this.translate.currentLang === 'hu' ? 'Játék törlése' : "Delete game",
      message: this.translate.currentLang === 'hu' ? 'Biztosan törölni szeretnéd a játékot?' :  "Are you sure you want to delete the game?",
      buttons: [
        {
          text: this.translate.currentLang === 'hu' ? 'Vissza' :  "Cancel",
          role: "cancel"
        },
        {
          text: this.translate.currentLang === 'hu' ? 'Törlés' :  "Delete",
          handler: () => {
            this.gamesService.deleteGame(id).subscribe(res => {
              this.gamesService.fetchOwnGames(this.loggedUser.id).subscribe(games => {
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

  navigateToGameMode() {
    this.router.navigate(['/', 'game-mode'], { queryParams: { gameId: this.game.id }});
  }

  shareGame() {
    this.modalCtrl.create({ component: ShareComponent, componentProps: { user: this.loggedUser, game: this.game } }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (modalData.data) {
          this.router.navigate(['/', 'connections', 'chat', modalData.data]);
        }
      });
      modalEl.present();
    });
  }

}
