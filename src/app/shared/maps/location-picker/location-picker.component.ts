import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {ActionSheetController, AlertController, ModalController} from "@ionic/angular";
import {MapModalComponent} from "../map-modal/map-modal.component";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {map, switchMap} from "rxjs/operators";
import {Coordinates, Location} from "../../../interfaces/Location"
import {of} from "rxjs";
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() pickLocation = new EventEmitter<Location>();
  @Input() location: Location;
  @Input() center: Coordinates;

  isLoading = false;

  constructor(private modalCtrl: ModalController,
              private http: HttpClient,
              private actionSheetCtrl: ActionSheetController,
              private alertCtrl: AlertController) {
  }

  ngOnInit() {
    console.log("location", this.location, this.center);
  }

  onPickLocation() {
    let center = (this.location)
      ? { lat: this.location.lat, lng: this.location.lng }
      : (this.center ? { lat: this.center.lat, lng: this.center.lng } : { lat: 47, lng: 19});
    console.log("center", center, this.location, this.center);
    this.actionSheetCtrl.create({ header: "Please choose", buttons: [
        { text: 'Auto-Locate', handler: () => { this.locateUser() } },
        { text: 'Pick On Map', handler: () => { this.openMap(center) } },
        { text: 'Cancel', role: 'cancel' }
      ]}).then(actionEl => {
        actionEl.present();
    });
  }

  locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Geolocation.getCurrentPosition()
      .then(geoPosition => {
        this.createLocation(geoPosition.coords.latitude, geoPosition.coords.longitude);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }

  openMap(center: Coordinates = { lat: 47, lng: 19}) {
    this.modalCtrl.create({component: MapModalComponent, componentProps: { center: center }}).then(modal => {
      modal.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (!modalData.data) {
          return;
        }
        this.createLocation(modalData.data.lat, modalData.data.lng);
      });
      modal.present();
    })
  }

  createLocation(lat: number, lng: number) {
    const pickedLocation: Location = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap(address => {
          pickedLocation.address = address;
          return of(
            this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe(staticMapImageUrl => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.location = pickedLocation;
        this.isLoading = false;
        this.pickLocation.emit(pickedLocation);
      });
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
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Location%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`
    //&signature=YOUR_SIGNATURE ??
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
