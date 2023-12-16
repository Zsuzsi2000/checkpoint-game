import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {environment} from "../../../../environments/environment";
import {Coordinates} from "../../../interfaces/Location";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center: Coordinates = { lat: 47, lng: 19};
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  clickListener: any;
  googleMaps: any;

  constructor(private modalCtrl: ModalController,
              private renderer: Renderer2,
              private translate: TranslateService) {

  }

  ngOnInit() {  }

  ngAfterViewInit(): void {
    this.getGoogleMaps()
      .then(googleMaps => {
        this.init(googleMaps);
      })
      .catch(err => {})
  }

  init(googleMaps) {
    this.googleMaps = googleMaps;
    const mapEl = this.mapElementRef.nativeElement;
    const map = new googleMaps.Map( mapEl, {
      center: this.center,
      zoom: 8
    });

    googleMaps.event.addListenerOnce(map, 'idle', () => {
      this.renderer.addClass(mapEl, 'visible');
    });

    if (this.selectable) {
      this.clickListener = map.addListener('click', event => {
        const selectedCoords = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        this.modalCtrl.dismiss(selectedCoords);
      });
    } else {
      const marker = new googleMaps.Marker({
        position: this.center,
        map: map,
        title: this.translate.currentLang === 'hu' ? 'Kiválasztott helyszín' : 'Picked Location'
      });
      marker.setMap(map);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
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
  }

}
