import { Component, OnInit } from '@angular/core';
import {LocationType} from "../../../enums/LocationType";
import {Coordinates} from "../../../interfaces/Location";
import {ActivatedRoute, Router} from "@angular/router";
import {Checkpoint} from "../../../models/checkpoint.model";
import {AlertController, NavController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-edit-checkpoints',
  templateUrl: './edit-checkpoints.page.html',
  styleUrls: ['./edit-checkpoints.page.scss'],
})
export class EditCheckpointsPage implements OnInit {

  locationType: LocationType;
  quiz: boolean;
  lat: number;
  lng: number;
  center: Coordinates;
  checkpoints: {checkpoint: Checkpoint, imageFile: File}[] = [];
  gameId: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private alertController: AlertController,
              private translate: TranslateService) {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      } else {
        this.gameId = paramMap.get('gameId')
      }
    }, error => {
      this.showALert();
    });
    switch (this.route.snapshot.queryParamMap.get('locationType')) {
      case "0": { this.locationType = LocationType.location; break; }
      case "1": { this.locationType = LocationType.description; break; }
      case "2": { this.locationType = LocationType.anywhere; break; }
    }
    this.quiz = this.route.snapshot.queryParamMap.get('quiz') === "true";
    this.lat = (this.route.snapshot.queryParamMap.get('lat') !== "null") ? Number(this.route.snapshot.queryParamMap.get('lat')) : null;
    this.lng = (this.route.snapshot.queryParamMap.get('lng') !== "null") ? Number(this.route.snapshot.queryParamMap.get('lng')) : null;
    this.checkpoints = JSON.parse(this.route.snapshot.queryParamMap.get('checkpoints'));
    if (this.lng !== null && this.lat !== null) {
      this.center = { lat: this.lat, lng: this.lng };
    }
  }

  ngOnInit() {}

  updateCheckpoints(event: {
    checkpoints: {checkpoint: Checkpoint, imageFile: File | Blob | string}[],
    mapUrl: string
  }) {
    this.router.navigate(['/', 'games', 'edit-game', this.gameId], {
      queryParams: {
        checkpoints: JSON.stringify(event.checkpoints),
        mapUrl: JSON.stringify(event.mapUrl)
      }
    });
  }

  showALert() {
    this.alertController
      .create(
        {
          header: this.translate.currentLang === 'hu' ? 'Hiba történt' : 'An error occured',
          message: this.translate.currentLang === 'hu' ? 'A játékot nem sikerült lekérni. Kérem próbálja újra később.' : 'Game could not be fetched. Please try again later.',
          buttons: [{
            text: (this.translate.currentLang === 'hu' ? 'Rendben' : 'Okay'), handler: () => {
              this.router.navigate(['/', 'games']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
