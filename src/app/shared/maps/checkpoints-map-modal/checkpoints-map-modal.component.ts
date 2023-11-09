import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Coordinates} from "../../../interfaces/Location";
import {ModalController} from "@ionic/angular";
import {environment} from "../../../../environments/environment";
import {Checkpoint} from "../../../models/checkpoint.model";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-checkpoints-map-modal',
  templateUrl: './checkpoints-map-modal.component.html',
  styleUrls: ['./checkpoints-map-modal.component.scss'],
})
export class CheckpointsMapModalComponent implements OnInit, AfterViewInit {

  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center!: Coordinates;
  @Input() checkpoints: Checkpoint[] = [];
  coordinates: Coordinates[] = [];
  clickListener: any;
  markerClickListeners: any[] = [];
  // markerDragListeners: any[] = [];
  googleMaps: any;
  map: any;
  infoWindow: any;
  marker: any;

  constructor(private modalCtrl: ModalController,
              private renderer: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.getGoogleMaps()
      .then(googleMaps => {
        // googleMaps.importLibrary("marker").then(m => {
        //   this.marker = m;
        //   this.init(googleMaps);
        // });
        this.init(googleMaps);
      })
      .catch(err => {
        console.log(err);
      })
  }

  init(googleMaps) {
    this.googleMaps = googleMaps;
    const mapEl = this.mapElementRef.nativeElement;
    this.map = new googleMaps.Map( mapEl, {
      center: this.center,
      zoom: 12,
      // mapId: "DEMO_MAP_ID",
    });

    googleMaps.event.addListenerOnce(this.map, 'idle', () => {
      this.renderer.addClass(mapEl, 'visible');
    });

    this.infoWindow = new this.googleMaps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });

    if (this.center) {
      this.addMarkerAndListenerToCheckpoint(this.center, -1, 'Start');
    }

    if (this.checkpoints) {
      this.checkpoints.forEach(checkpoint => {
        if (checkpoint.locationAddress) {
          this.addMarkerAndListenerToCheckpoint({
            lat: checkpoint.locationAddress.lat,
            lng: checkpoint.locationAddress.lng
          }, checkpoint.index, checkpoint.name);
        }
      })
    }

    this.clickListener = this.map.addListener('click', event => {
      const selectedCoords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.addMarkerAndListenerToCoords(selectedCoords);
    });
  }

  onDone() {
    this.modalCtrl.dismiss(this.coordinates);
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  addMarkerAndListenerToCoords(coords: Coordinates) {
    let index = this.checkpoints.length + this.coordinates.length;
    this.coordinates.push(coords);
    // const style = new this.marker.PinElement({
    //   background: 'red',
    //   borderColor: '',
    //   glyphColor: '',
    //   glyph: `${index + 1}`
    // });
    const marker = new this.googleMaps.Marker({
      position: coords,
      map: this.map,
      // gmpDraggable: true,
      title: `${index + 1}.`,
      // content: style.element
    });
    marker.setMap(this.map);
    this.markerClickListeners.push(marker.addListener("click", () => {
      this.infoWindow.close();
      this.infoWindow.setContent(marker.title);
      this.infoWindow.open(marker.map, marker);
    }));

    // this.markerDragListeners.push(marker.addListener('dragend', (event) => {
    //   this.infoWindow.close();
    //   this.coordinates[+marker.title-this.checkpoints.length] =  marker.position;
    //   this.infoWindow.open(marker.map, marker);
    // }));
  }

  addMarkerAndListenerToCheckpoint(coords: Coordinates, index: number, title: string = "") {
    // const style = new this.marker.PinElement({
    //   background: 'blue',
    //   borderColor: '',
    //   glyphColor: '',
    //   glyph: `${index + 1}`
    // });
    const marker = new this.googleMaps.Marker({
      position: coords,
      map: this.map,
      title: `${index + 1}. ${title}`,
      // content: style.element
    });
    marker.setMap(this.map);
    this.markerClickListeners.push(marker.addListener("click", () => {
      this.infoWindow.close();
      this.infoWindow.setContent(marker.title);
      this.infoWindow.open(marker.map, marker);
    }));
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsAPIKey}&callback=initMap`;
      // script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsAPIKey}&libraries=places,marker&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available');
        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
    this.markerClickListeners.forEach(markerListener => {
      this.googleMaps.event.removeListener(markerListener);
    });
    // this.markerDragListeners.forEach(markerListener => {
    //   this.googleMaps.event.removeListener(markerListener);
    // });

  }

}
