import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {GamesService} from "../../games/games.service";
import {TranslateService} from "@ngx-translate/core";
import {take} from "rxjs/operators";

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
              private router: Router,
              private translate: TranslateService) { }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has('gameId')) {
      this.gameId = this.activatedRoute.snapshot.queryParamMap.get('gameId');
      this.gamesService.fetchGame(this.gameId).pipe(take(1)).subscribe(res =>  {
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
      this.showALert(this.translate.currentLang === 'hu' ? 'Valami nem sikerült az esemény ltrehozásakor' : 'Something went wrong while creating the event');
    }
  }

  showALert(message: string = this.translate.currentLang === 'hu' ? 'A játékot nem sikerült lekérni' : 'Game could not be fetched.') {
    this.alertCtrl
      .create(
        {
          header:  this.translate.currentLang === 'hu' ? 'Probléma adódott' :  'An error occured',
          message: message,
          buttons: [{
            text: (this.translate.currentLang === 'hu' ? 'Rendben' : 'Okay'), handler: () => {
              this.navCtrl.pop();
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
