import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {LocationType} from "../../../enums/LocationType";
import {Location} from "../../../interfaces/Location";

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
  center: { lat: number, lng: number };

  constructor(private route: ActivatedRoute) {
    console.log(
      this.route.snapshot.queryParamMap.get('locationType'),
      this.route.snapshot.queryParamMap.get('quiz'),
      this.route.snapshot.queryParamMap.get('lat'),
      this.route.snapshot.queryParamMap.get('lng'),
    );
    switch (this.route.snapshot.queryParamMap.get('locationType')) {
      case "0": { this.locationType = LocationType.location; break; }
      case "1": { this.locationType = LocationType.description; break; }
      case "2": { this.locationType = LocationType.anywhere; break; }
    }
    this.quiz = this.route.snapshot.queryParamMap.get('quiz') === "true";
    this.lat = (this.route.snapshot.queryParamMap.get('lat') !== "null") ? Number(this.route.snapshot.queryParamMap.get('lat')) : null;
    this.lng = (this.route.snapshot.queryParamMap.get('lng') !== "null") ? Number(this.route.snapshot.queryParamMap.get('lng')) : null;
    if (this.lng !== null && this.lat !== null) {
      this.center = { lat: this.lat, lng: this.lng };
      console.log("center", this.center);
    }
  }

  ngOnInit() {}

}
