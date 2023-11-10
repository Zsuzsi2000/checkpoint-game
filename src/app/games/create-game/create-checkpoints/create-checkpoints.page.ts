import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LocationType} from "../../../enums/LocationType";
import {Coordinates, Location} from "../../../interfaces/Location";
import {Checkpoint} from "../../../models/checkpoint.model";

@Component({
  selector: 'app-create-checkpoints',
  templateUrl: './create-checkpoints.page.html',
  styleUrls: ['./create-checkpoints.page.scss'],
})
export class CreateCheckpointsPage implements OnInit {

  locationType: LocationType;
  quiz: boolean;
  lat: number;
  lng: number;
  center: Coordinates;
  checkpoints: {checkpoint: Checkpoint, imageFile: File}[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {
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

  addCheckpointToGame(event: {
    checkpoints: {checkpoint: Checkpoint, imageFile: File | Blob | string}[],
    mapUrl: string
  }) {
    this.router.navigate(['/', 'games', 'create-game'], {
      queryParams: {
        checkpoints: JSON.stringify(event.checkpoints),
        mapUrl: JSON.stringify(event.mapUrl)
      }
    });
  }

}
