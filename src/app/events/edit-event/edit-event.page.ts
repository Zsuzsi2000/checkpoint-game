import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {EventsService} from "../events.service";
import {Event} from "../../models/event.model";

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
              private router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('eventId')) {
        this.showALert();
      }

      this.eventsService.fetchEvent(paramMap.get('eventId')).subscribe(event => {
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
      this.showALert('Something went wrong while editing the event');
    }
  }

  showALert(message: string = 'Event could not be fetched.') {
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
