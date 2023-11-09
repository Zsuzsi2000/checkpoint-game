import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {Checkpoint} from "../../../models/checkpoint.model";
import {ItemReorderEventDetail, ModalController} from "@ionic/angular";
import {CheckpointEditorComponent} from "../checkpoint-editor/checkpoint-editor.component";
import {LocationType} from "../../../enums/LocationType";
import {Coordinates, Location} from "../../../interfaces/Location";
import {CheckpointsMapModalComponent} from "../../maps/checkpoints-map-modal/checkpoints-map-modal.component";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map, switchMap} from "rxjs/operators";
import {forkJoin, of} from "rxjs";


@Component({
  selector: 'app-checkpoints-editor',
  templateUrl: './checkpoints-editor.component.html',
  styleUrls: ['./checkpoints-editor.component.scss'],
})
export class CheckpointsEditorComponent implements OnInit {

  @Input() checkpoints: {checkpoint: Checkpoint, imageFile: File | Blob}[]  = [];
  @Input() center!: Coordinates;
  @Input() locationType!: LocationType;
  @Input() quiz!: boolean;
  @Output() checkpointsDone = new EventEmitter<{ checkpoints: {checkpoint: Checkpoint, imageFile: File | Blob}[], mapUrl: string}>();
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

  checkpointsIsDone() {
    let checkpointsIsDone = true;
    if (this.checkpoints.length > 0) {
      this.checkpoints.forEach(checkpoint => {
        if (!checkpoint.checkpoint.name) {
          checkpointsIsDone = false;
        }
      })
    } else {
      checkpointsIsDone = false;
    }
    return checkpointsIsDone;
  }

  done() {
    this.checkpointsDone.emit({
      checkpoints: this.checkpoints,
      mapUrl: this.checkpointsOnMap
    })
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.checkpoints = ev.detail.complete(this.checkpoints);
    this.checkpoints.forEach((checkpointBig, index) => {
      checkpointBig.checkpoint.index = index;
    });
    if (this.locationType === LocationType.location || this.locationType === LocationType.description) {
      this.setUpCoords();
    }
  }

  reorder() {
    this.reorderMode = !this.reorderMode;
  }

  selectOnMap() {
    console.log("checkpoints", this.checkpoints, this.checkpoints.map( bigCheckpoint => bigCheckpoint.checkpoint));
    this.modalCtrl.create({
      component: CheckpointsMapModalComponent,
      componentProps: (this.checkpoints && this.checkpoints.length > 0)
        ? { center: this.center, checkpoints: this.checkpoints.map( bigCheckpoint => bigCheckpoint.checkpoint) }
        : { center: this.center }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        const observables = [];
        const actualLength = this.checkpoints.length;
        if (modalData.data) {
          (modalData.data as Coordinates[]).forEach((coordinate, i) => {
            this.isLoading = true;
            const pickedLocation: Location = {
              lat: coordinate.lat,
              lng: coordinate.lng,
              address: null,
              staticMapImageUrl: null
            };
            observables.push(this.getAddress(coordinate.lat, coordinate.lng)
              .pipe(
                switchMap(address => {
                  pickedLocation.address = address;
                  return of(
                    this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
                  );
                })
              ).pipe(
                map(staticMapImageUrl => {
                  pickedLocation.staticMapImageUrl = staticMapImageUrl;
                  return  {location: pickedLocation, index: i};
                }))
            );
          })
        }
        forkJoin(observables).subscribe( (data: {location: Location, index: number}[]) => {
          console.log("data", data);
          data.forEach(d => {
            let newCheckpoint = new Checkpoint(actualLength + d.index,null,null, null, null, d.location, null, null);
            this.checkpoints.push({ checkpoint: newCheckpoint, imageFile: null});
          });

          if (this.locationType === LocationType.location || this.locationType === LocationType.description) {
            this.setUpCoords();
          }
          this.isLoading = false;
        });

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
          (modalData.data.checkpoint as Checkpoint).index = this.checkpoints.length;
          this.checkpoints.push({ checkpoint: modalData.data.checkpoint, imageFile: modalData.data.imageFile });
          if (this.locationType === LocationType.location || this.locationType === LocationType.description) {
            this.setUpCoords();
          }
        }
      });
      modalEl.present();
    })
  }

  editCheckpoint(data: {checkpoint: Checkpoint, imageFile: File | Blob}) {
    console.log(data,"editedCheckpoint");
    this.modalCtrl.create({
      component: CheckpointEditorComponent,
      componentProps: { locationType: this.locationType, isQuiz: this.quiz, center: this.center, checkpoint: data.checkpoint, imageFile: data.imageFile }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data, this.checkpoints);
        if (modalData.data) {
          let editedIndex = this.checkpoints.findIndex(checkpoint => checkpoint.checkpoint.index === modalData.data.checkpoint.index);
          this.checkpoints[editedIndex] = { checkpoint: modalData.data.checkpoint, imageFile: modalData.data.imageFile };
          console.log(this.checkpoints[editedIndex], this.checkpoints);
        }
      });
      modalEl.present();
    })
  }

  deleteCheckpoint(index: number) {
    this.checkpoints = this.checkpoints.filter(checkpoint => checkpoint.checkpoint.index != index);
    this.checkpoints.forEach((checkpointBig, index) => {
      checkpointBig.checkpoint.index = index;
    });
    if (this.locationType === LocationType.location || this.locationType === LocationType.description) {
      this.setUpCoords();
    }
  }

  setUpCoords() {
    let coords: Coordinates[] = [this.center];
    if (this.checkpoints && this.locationType === LocationType.location) {
      this.checkpoints.forEach(checkpoint => {
        if (checkpoint.checkpoint.locationAddress) {
          coords.push({
            lat: checkpoint.checkpoint.locationAddress.lat,
            lng: checkpoint.checkpoint.locationAddress.lng
          })
        }
      })
    }
    this.checkpointsOnMap = this.getMapImageFromLocations(this.center, coords, 14);
  }


  private getMapImageFromLocations(center: Coordinates, coords: Coordinates[], zoom: number) {
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
