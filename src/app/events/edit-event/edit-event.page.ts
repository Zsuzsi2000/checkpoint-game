import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {EventsService} from "../events.service";
import {Event} from "../../models/event.model";
import {TranslateService} from "@ngx-translate/core";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.page.html',
  styleUrls: ['./edit-event.page.scss'],
})
export class EditEventPage implements OnInit {

  gameId: string;
  event: Event;
  isLoading = false;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private eventsService: EventsService,
              private router: Router,
              private translate: TranslateService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('eventId')) {
        this.showALert();
      }

      this.eventsService.fetchEvent(paramMap.get('eventId')).pipe(take(1)).subscribe(event => {
        if (event) {
          this.event = event;
          this.gameId = this.event.gameId;
          this.isLoading = false;
        } else {
          this.showALert();
        }
      });
    });
  }

  navigateToEvent(res) {
    if (res) {
      this.router.navigate(['/', 'events', 'details', this.event.id])
    } else {
      this.showALert(this.translate.currentLang === "hu" ? 'Valami rosszul sikerült az esemény szerkesztésekor' : 'Something went wrong while editing the event');
    }
  }

  showALert(message: string = this.translate.currentLang === "hu" ? 'Az eseményt nem sikerült lekérni.' : 'Event could not be fetched.') {
    this.alertCtrl
      .create(
        {
          header:  this.translate.currentLang === "hu" ? 'Hiba történt' :  'An error occured',
          message: message,
          buttons: [{
            text: (this.translate.currentLang === "hu" ? 'Rendben' :  'Okay'), handler: () => {
              this.navCtrl.pop();
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
