import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {GamesService} from "../../games/games.service";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
})
export class CreateEventPage implements OnInit {

  gameId: string;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private gamesService: GamesService) { }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has('gameId')) {
      this.gameId = this.activatedRoute.snapshot.queryParamMap.get('gameId');
      this.gamesService.fetchGame(this.gameId).subscribe(res =>  {
        console.log(res);
        if (res === null) this.showALert();
      })
    } else {
      this.showALert();
    }
  }

  navigateToEvent(event) {
    console.log(event);
  }

  showALert() {
    this.alertCtrl
      .create(
        {
          header: 'An error occured',
          message: 'Game could not be fetched.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.navCtrl.pop();
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
