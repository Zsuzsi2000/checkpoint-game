import {Component, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from "@ionic/angular";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Checkpoint} from "../../models/checkpoint.model";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ImageService} from "../../services/image.service";
import {catchError, map, switchMap, take} from "rxjs/operators";
import {forkJoin, of} from "rxjs";
import {Coordinates, Location} from "../../interfaces/Location";
import {LocationType} from "../../enums/LocationType";
import {LocationIdentification} from "../../enums/LocationIdentification";
import {Game} from "../../models/game.model";
import {PickAThingComponent} from "../../shared/components/pick-a-thing/pick-a-thing.component";
import {environment} from "../../../environments/environment";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {

  gameForm: FormGroup;
  game: Game;
  categories: { id: string, name: string }[];
  countries = [];
  selectedCountry: string = "";
  LocationType = LocationType;
  LocationIdentification = LocationIdentification;
  checkpoints: { checkpoint: Checkpoint, imageFile: File | Blob | string }[] = [];
  mapUrl = "";
  checkpointsChanged = false;
  isLoading = false;
  first = true;
  currentLanguage = "";

  constructor(private gamesService: GamesService,
              private countryService: CountryService,
              private navCtrl: NavController,
              private router: Router,
              private imageService: ImageService,
              private loadingCtrl: LoadingController,
              private activatedRoute: ActivatedRoute,
              private alertController: AlertController,
              private modalCtrl: ModalController,
              private translate: TranslateService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      }
      this.isLoading = true;

      if (this.first && this.checkpoints.length === 0) {
        this.gamesService.fetchGame(paramMap.get('gameId')).subscribe(game => {
          this.game = game;
          this.selectedCountry = this.game.country;
          this.isLoading = false;
          game.checkpoints.forEach(checkpoint => {
            this.checkpoints.push({checkpoint: checkpoint, imageFile: null})
          });

          this.gameForm = new FormGroup({
            name: new FormControl(this.game.name, {updateOn: "change", validators: [Validators.required]}),
            category: new FormControl(this.game.category, {updateOn: "change", validators: [Validators.required]}),
            newCategory: new FormControl(null, {updateOn: "change"}),
            description: new FormControl(this.game.description, {
              updateOn: "change",
              validators: [Validators.required]
            }),
            pointOfDeparture: new FormControl(this.game.pointOfDeparture, {updateOn: "change"}),
            imgUrl: new FormControl(this.game.imgUrl, {updateOn: "change"}),
            mapUrl: new FormControl(this.game.mapUrl, {updateOn: "change"}),
            distance: new FormControl(this.game.distance, {updateOn: "change", validators: [Validators.required]}),
            duration: new FormControl(this.game.duration, {updateOn: "change", validators: [Validators.required]}),
            itIsPublic: new FormControl(this.game.itIsPublic, {updateOn: "change"}),
          });

          this.first = false;
        }, error => {
          this.showALert();
        });
      }
    }, error => {
      this.showALert();
    });

    this.gamesService.fetchCategories().pipe(take(1)).subscribe(categories => {
      if (categories) {
        this.categories = categories;
      }
    });
    this.countryService.fetchCountries().subscribe(countries => {
      if (countries) this.countries = countries;
    });
  }

  ionViewWillEnter() {
    if (this.activatedRoute.snapshot.queryParamMap.has('checkpoints')) {
      this.checkpoints = JSON.parse(this.activatedRoute.snapshot.queryParamMap.get('checkpoints'));
      this.checkpointsChanged = true;
    }
    if (this.activatedRoute.snapshot.queryParamMap.has('mapUrl')) {
      this.mapUrl = JSON.parse(this.activatedRoute.snapshot.queryParamMap.get('mapUrl'));
    }
  }

  updateGame() {
    let category = (this.gameForm.value.category === 'otherCategory')
      ? this.gameForm.value.newCategory
      : this.gameForm.value.category;

    if (!this.gameForm.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating game...'
    }).then(loadingEl => {
      loadingEl.present();
      let checkpoints: Checkpoint[] = [];
      let imageUrl;
      this.uploadImages().pipe(
        catchError(error => {
          checkpoints = this.checkpoints.map(data => {
            if (data.checkpoint.locationAddress && data.checkpoint.locationAddress.staticMapImageUrl) {
              data.checkpoint.imgUrl = data.checkpoint.locationAddress.staticMapImageUrl;
            }
            return data.checkpoint;
          });
          return of(null);
        }),
        switchMap(check => {
          if (check) {
            checkpoints = check;
          }

          return (this.gameForm.get('imgUrl').value !== this.game.imgUrl)
            ? this.imageService.uploadImage(this.gameForm.get('imgUrl').value)
            : of(this.game.imgUrl);

        })).pipe(
        catchError(error => {
          return of(null);
        }),
        switchMap(uploadResponse => {
          imageUrl = (uploadResponse)
            ? (uploadResponse.imageUrl) ? uploadResponse.imageUrl : uploadResponse
            : (this.gameForm.value.pointOfDeparture) ? (this.gameForm.value.pointOfDeparture as Location).staticMapImageUrl : null;

          return (this.game.locationType === LocationType.description && (this.gameForm.get('mapUrl').value !== this.game.mapUrl))
            ? this.imageService.uploadImage(this.gameForm.get('mapUrl').value) : of(null);
        })).pipe(
        catchError(error => {
          console.log('Error from uploadImage map:', error);
          return of(null);
        }),
        switchMap(uploadResponse => {
          checkpoints = checkpoints.sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0));

          let mapUrl;
          if (this.game.locationType === LocationType.location) {
            mapUrl = (this.game.pointOfDeparture !== this.gameForm.value.pointOfDeparture)
              ? (this.mapUrl) ? this.mapUrl : this.getMap(checkpoints)
              : (this.mapUrl) ? this.mapUrl : this.game.mapUrl;
          } else if (this.game.locationType === LocationType.description) {
            mapUrl = (uploadResponse) ? uploadResponse.imageUrl : this.game.mapUrl;
          }

          return this.gamesService.updateGame(
            this.game.id,
            this.gameForm.value.name,
            this.game.locationType,
            this.game.locationIdentification,
            this.selectedCountry,
            this.gameForm.value.pointOfDeparture,
            category,
            this.game.quiz,
            this.gameForm.value.description,
            imageUrl,
            this.gameForm.value.distance,
            this.gameForm.value.duration,
            this.gameForm.value.itIsPublic,
            mapUrl,
            checkpoints,
            this.game.numberOfAttempts,
            this.game.creationDate,
            this.game.ratings
          )
        })).subscribe(game => {
        this.handleGameCreationSuccess(this.game.id, category, loadingEl);
      });
    });
  }

  uploadImages() {
    let checkpoints: Checkpoint[] = [];
    const observables = [];
    this.checkpoints.forEach(data => {
      if (data.imageFile) {
        let imageFile = this.convertToBlob(data.imageFile);
        observables.push(this.imageService.uploadImage(imageFile).pipe(map(uploaded => {
          data.checkpoint.imgUrl = uploaded.imageUrl;
          return data.checkpoint;
        })));
      } else if (data.checkpoint.imgUrl) {
        checkpoints.push(data.checkpoint);
      } else if (data.checkpoint.locationAddress && data.checkpoint.locationAddress.staticMapImageUrl) {
        data.checkpoint.imgUrl = data.checkpoint.locationAddress.staticMapImageUrl;
        checkpoints.push(data.checkpoint);
      } else {
        checkpoints.push(data.checkpoint);
      }
    });

    return (observables.length > 0)
      ? (forkJoin(observables).pipe(
        map(result => {
          checkpoints = checkpoints.concat(result as Checkpoint[]);
          return checkpoints;
        })))
      : of(checkpoints);

  }

  handleGameCreationSuccess(gameId, category, loadingEl) {
    loadingEl.dismiss();
    if (this.categories.find(c => c.name === category) === undefined) {
      this.gamesService.createCategory(category).subscribe(categories => {
        this.categories = categories;
      });
    }
    this.router.navigate(['/games/details', gameId]);
    this.gameForm.reset();
  }

  getMap(checkpoints: Checkpoint[]): string {
    let center = {lat: this.game.pointOfDeparture.lat, lng: this.game.pointOfDeparture.lng};
    let coords: Coordinates[] = [center];
    checkpoints.forEach(checkpoint => {
      if (checkpoint.locationAddress) {
        coords.push({
          lat: checkpoint.locationAddress.lat,
          lng: checkpoint.locationAddress.lng
        })
      }
    });

    return this.getMapImageFromLocations(center, coords, 14);
  }

  private getMapImageFromLocations(center: Coordinates, coords: Coordinates[], zoom: number): string {
    let longUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=500x300&maptype=roadmap`;
    coords.forEach((coord, index) => {
      let color = (index === 0) ? 'red' : 'blue';
      let nextUrlPart = `&markers=color:${color}%7Clabel:${index}%7C${coord.lat},${coord.lng}`;
      longUrl = longUrl + nextUrlPart;
    });
    longUrl = longUrl + `&key=${environment.googleMapsAPIKey}`;
    return longUrl
  }

  openCheckpointsEditor() {
    this.router.navigate(['/', 'games', 'edit-game', 'edit-checkpoints', this.game.id], {
      queryParams: {
        locationType: this.game.locationType,
        quiz: this.game.quiz,
        lat: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lat : null,
        lng: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lng : null,
        checkpoints: JSON.stringify(this.checkpoints)
      }
    });
  }

  selectCountry() {
    this.modalCtrl.create({
      component: PickAThingComponent, componentProps: {
        countries: this.countries,
        selectedCountry: this.selectedCountry
      }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modal => {
        if (modal.data) {
          this.selectedCountry = modal.data;
        }
      });
      modalEl.present();
    })
  }

  onLocationPicked(location: Location) {
    this.gameForm.patchValue({pointOfDeparture: location})
  }

  onImagePick(imageData: string | File | Blob, type: string) {
    let imageFile = this.convertToBlob(imageData);
    if (type === 'image') {
      this.gameForm.patchValue({imgUrl: imageFile});
    } else {
      this.gameForm.patchValue({mapUrl: imageFile});
    }
  }

  convertToBlob(imageData: string | File | Blob) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imageService.convertbase64toBlob(imageData);
      } catch (error) {
        console.log("error", error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    return imageFile;
  }

  setPublic(event) {
    this.gameForm.patchValue({ itIsPublic: event.detail.value === "true" });
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
