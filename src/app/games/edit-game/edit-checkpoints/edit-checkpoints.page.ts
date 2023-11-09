import { Component, OnInit } from '@angular/core';
import {LocationType} from "../../../enums/LocationType";
import {Coordinates} from "../../../interfaces/Location";
import {ActivatedRoute, Router} from "@angular/router";
import {Checkpoint} from "../../../models/checkpoint.model";
import {AlertController, NavController} from "@ionic/angular";
import {Preferences} from "@capacitor/preferences";


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
              private alertController: AlertController) {
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
      console.log("center", this.center);
    }
  }

  ngOnInit() {}

  updateCheckpoints(event: {
    checkpoints: {checkpoint: Checkpoint, imageFile: File}[],
    mapUrl: string
  }) {
    console.log("event", event);
    // let checks = event.checkpoints.map(data => {
    //   console.log(data);
    //   if (data.imageFile) {
    //     const reader = new FileReader();
    //     let base64String ;
    //     reader.onload = (event) => {
    //       base64String = event.target.result; // This is the Base64-encoded image
    //       console.log(base64String);
    //       return { checkpoint: data.checkpoint, imageFile: base64String };
    //     };
    //     reader.readAsDataURL(data.imageFile);
    //
    //     // return { checkpoint: data.checkpoint, imageFile: base64String };
    //   } else {
    //     return { checkpoint: data.checkpoint, imageFile: null };
    //   }
    // });
    //
    // Preferences.set({key: 'checkpoints', value: JSON.stringify(checks)});
    // console.log(JSON.stringify(checks));

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
          header: 'An error occured',
          message: 'Game could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/', 'games']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

}
