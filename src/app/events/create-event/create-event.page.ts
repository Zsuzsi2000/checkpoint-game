import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
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
              private gamesService: GamesService,
              private router: Router) { }

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

  navigateToEvent(newId) {
    if (newId) {
      this.router.navigate(['/', 'events', 'details', newId])
    } else {
      this.showALert('Something went wrong while creating the event');
    }
  }

  showALert(message: string = 'Game could not be fetched.') {
    this.alertCtrl
      .create(
        {
          header: 'An error occured',
          message: message,
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
