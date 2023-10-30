import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {MapModalComponent} from "../map-modal/map-modal.component";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {map, switchMap} from "rxjs/operators";
import {Location} from "../../../interfaces/Location"
import {of} from "rxjs";

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() pickLocation = new EventEmitter<Location>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(private modalCtrl: ModalController,
              private http: HttpClient) {
  }

  ngOnInit() {
  }

  onPickLocation() {
    this.modalCtrl.create({component: MapModalComponent}).then(modal => {
      modal.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (!modalData.data) {
          return;
        }

        const pickLocation: Location = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };
        this.isLoading = true;
        this.getAddress(pickLocation.lat, pickLocation.lng).pipe(
          switchMap(address => {
            console.log("Address", address);
            pickLocation.address = address;
            return of(this.getMapImage(pickLocation.lat, pickLocation.lng, 14));

          })).subscribe( staticMapImageUrl => {
            pickLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.pickLocation.emit(pickLocation);
            this.isLoading = false;
        })
      });
      modal.present();
    })
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`)
      .pipe(map((geoData: any) => {
        console.log(geoData);
        if (!geoData || !geoData.results || geoData.results.length === 0) {
          return null;
        }
        return geoData.results[0].formatted_address;
      }))
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    //TODO: you can add many markers!!!
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:blue%7Clabel:Location%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`
    //&signature=YOUR_SIGNATURE ??
  }

}
