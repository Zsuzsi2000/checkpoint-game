import {Component, Input, OnInit} from '@angular/core';
import {Checkpoint} from "../../../models/checkpoint.model";
import {ItemReorderEventDetail, ModalController} from "@ionic/angular";
import {CheckpointEditorComponent} from "../checkpoint-editor/checkpoint-editor.component";
import {LocationType} from "../../../enums/LocationType";
import {Coordinates, Location} from "../../../interfaces/Location";
import {CheckpointsMapModalComponent} from "../../maps/checkpoints-map-modal/checkpoints-map-modal.component";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map, switchMap} from "rxjs/operators";
import {of} from "rxjs";


@Component({
  selector: 'app-checkpoints-editor',
  templateUrl: './checkpoints-editor.component.html',
  styleUrls: ['./checkpoints-editor.component.scss'],
})
export class CheckpointsEditorComponent implements OnInit {

  @Input() checkpoints: Checkpoint[] = [];
  @Input() center!: Coordinates;
  @Input() locationType!: LocationType;
  @Input() quiz!: boolean;
  reorderMode = false;
  LocationType = LocationType;
  checkpointsOnMap: string;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {
    console.log(this.center);
    if (this.locationType === LocationType.location || this.locationType === LocationType.description) {
      this.setUpCoords();
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(this.checkpoints);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.checkpoints = ev.detail.complete(this.checkpoints);
    this.checkpoints.forEach((checkpoint, index) => {
      checkpoint.index = index;
    })
  }

  reorder() {
    this.reorderMode = !this.reorderMode;
  }

  selectOnMap() {
    this.modalCtrl.create({
      component: CheckpointsMapModalComponent,
      componentProps: (this.checkpoints && this.checkpoints.length > 0)
        ? { center: this.center, checkpoints: this.checkpoints }
        : { center: this.center }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (modalData.data) {
          (modalData.data as Coordinates[]).forEach((coordinate, i) => {
            this.isLoading = true;
            const pickedLocation: Location = {
              lat: coordinate.lat,
              lng: coordinate.lng,
              address: null,
              staticMapImageUrl: null
            };
            this.getAddress(coordinate.lat, coordinate.lng)
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
                let newCheckpoint = new Checkpoint(this.checkpoints.length,null,null, null, null, pickedLocation, null, null);
                this.checkpoints.push(newCheckpoint);
                if (modalData.data.length === i + 1) {
                  this.isLoading = false;
                  this.setUpCoords();
                }
              });
          })
        }
      });
      modalEl.present();
    })
  }

  addCheckpoint() {
    this.modalCtrl.create({
      component: CheckpointEditorComponent,
      componentProps: { locationType: this.locationType, isQuiz: this.quiz, center: this.center }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (modalData.data) {
          (modalData.data as Checkpoint).index = this.checkpoints.length;
          this.checkpoints.push(modalData.data);
        }
      });
      modalEl.present();
    })
  }

  editCheckpoint(editedCheckpoint: Checkpoint) {
    console.log(editedCheckpoint,"editedCheckpoint");
    this.modalCtrl.create({
      component: CheckpointEditorComponent,
      componentProps: { locationType: this.locationType, isQuiz: this.quiz, center: this.center, checkpoint: editedCheckpoint }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (modalData.data) {
          let editedIndex = this.checkpoints.findIndex(checkpoint => checkpoint.index === modalData.data.index);
          this.checkpoints[editedIndex] = modalData.data;
        }
      });
      modalEl.present();
    })
  }

  deleteCheckpoint(index: number) {
    this.checkpoints = this.checkpoints.filter(checkpoint => checkpoint.index != index);
  }

  setUpCoords() {
    let coords: Coordinates[] = [this.center];
    if (this.checkpoints && this.locationType === LocationType.location) {
      this.checkpoints.forEach(checkpoint => {
        if (checkpoint.locationAddress) {
          coords.push({
            lat: checkpoint.locationAddress.lat,
            lng: checkpoint.locationAddress.lng
          })
        }
      })
    }
    this.checkpointsOnMap = this.getMapImageFromLocations(this.center, coords, 14);
  }


  private getMapImageFromLocations(center: Coordinates, coords: Coordinates[], zoom: number) {
    //TODO: you can add many markers!!!
    let longUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=500x300&maptype=roadmap`;
    coords.forEach((coord, index) => {
      let color = (index === 0) ? 'red' : 'blue';
      let nextUrlPart = `&markers=color:${color}%7Clabel:${index}%7C${coord.lat},${coord.lng}`;
      longUrl = longUrl + nextUrlPart;
    });
    longUrl = longUrl + `&key=${environment.googleMapsAPIKey}`;
    return longUrl
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
  }

}
