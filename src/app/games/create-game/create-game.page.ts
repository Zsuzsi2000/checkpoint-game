import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {IonModal, LoadingController, ModalController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, map, switchMap, take} from "rxjs/operators";
import {Location} from "../../interfaces/Location";
import {LocationType} from "../../enums/LocationType";
import {LocationIdentification} from "../../enums/LocationIdentification";
import {ImageService} from "../../services/image.service";
import {Checkpoint} from "../../models/checkpoint.model";
import {forkJoin, of} from "rxjs";
import {PickAThingComponent} from "../../shared/components/pick-a-thing/pick-a-thing.component";

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {

  gameForm: FormGroup;
  categories: { id: string, name: string }[];
  countries = [];
  selectedCountry: string = "";
  LocationType = LocationType;
  LocationIdentification = LocationIdentification;
  checkpointsReady = false;
  checkpoints: {checkpoint: Checkpoint, imageFile: File | Blob | string}[] = [];
  mapUrl = "";

  constructor(private gamesService: GamesService,
              private countryService: CountryService,
              private router: Router,
              private imageService: ImageService,
              private loadingCtrl: LoadingController,
              private activatedRoute: ActivatedRoute,
              private modalCtrl: ModalController) {}

  ngOnInit() {
    this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    this.gameForm = new FormGroup({
      name: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      category: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      newCategory: new FormControl(null, {updateOn: "change"}),
      description: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      quiz: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      locationType: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      locationIdentification: new FormControl(null, {updateOn: "change"}),
      pointOfDeparture: new FormControl(null, {updateOn: "change"}),
      imgUrl: new FormControl(null, {updateOn: "change"}),
      mapUrl: new FormControl(null, {updateOn: "change"}),
      distance: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      duration: new FormControl(null, {updateOn: "change", validators: [Validators.required]}),
      itIsPublic: new FormControl(null, {updateOn: "change"}),
    });
    this.gamesService.fetchCategories().pipe(take(1)).subscribe(categories => {
      if (categories) {
        this.categories = categories;
      }
    })
  }

  ionViewWillEnter() {
    if (this.activatedRoute.snapshot.queryParamMap.has('checkpoints')) {
      this.checkpoints = JSON.parse(this.activatedRoute.snapshot.queryParamMap.get('checkpoints'));
      this.checkpointsReady = true;
    }
    if (this.activatedRoute.snapshot.queryParamMap.has('mapUrl')) {
      this.mapUrl = JSON.parse(this.activatedRoute.snapshot.queryParamMap.get('mapUrl'));
    }
  }

  createGame() {
    let category = (this.gameForm.value.category === 'otherCategory')
      ? this.gameForm.value.newCategory
      : this.gameForm.value.category;

    if (this.gameForm.value.locationType === LocationType.location) {
      this.gameForm.patchValue({locationIdentification: LocationIdentification.locator});
    }

    if (!this.gameForm.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating game...'
    }).then(loadingEl => {
      loadingEl.present();
      let checkpoints: Checkpoint[] = [];
      let imageUrl;
      this.uploadImages().pipe(
        catchError(error => {
          console.log('Error from uploadImages:', error);
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
          return (this.gameForm.get('imgUrl').value) ? this.imageService.uploadImage(this.gameForm.get('imgUrl').value) : of(null);
      })).pipe(
        catchError(error => {
          console.log('Error from uploadImage image:', error);
          return of(null);
        }),
        switchMap(uploadResponse => {
          imageUrl = (uploadResponse)
            ? uploadResponse.imageUrl
            : (this.gameForm.value.pointOfDeparture) ? (this.gameForm.value.pointOfDeparture as Location).staticMapImageUrl : null;

          return (this.gameForm.value.locationType === LocationType.description && this.gameForm.get('mapUrl').value)
            ? this.imageService.uploadImage(this.gameForm.get('mapUrl').value) : of(null);
        })).pipe(
        catchError(error => {
          console.log('Error from uploadImage map:', error);
          return of(null);
        }),
        switchMap(uploadResponse => {
          checkpoints = checkpoints.sort((a, b) =>  a.index < b.index ? -1 : (a.index > b.index ? 1 : 0));

          let mapUrl = (uploadResponse) ? uploadResponse.imageUrl : null;

        return this.gamesService.createGame(
          this.gameForm.value.name,
          this.gameForm.value.locationType,
          this.gameForm.value.locationIdentification,
          this.selectedCountry,
          this.gameForm.value.pointOfDeparture,
          category,
          this.gameForm.value.quiz,
          this.gameForm.value.description,
          imageUrl,
          this.gameForm.value.distance,
          this.gameForm.value.duration,
          this.gameForm.value.itIsPublic,
          (this.gameForm.value.locationType === LocationType.description) ? mapUrl : this.mapUrl,
          checkpoints
        )
      })).subscribe( gameId => {
        this.handleGameCreationSuccess(gameId, category, loadingEl);
      });
    });
  }

  uploadImages() {
    let checkpoints: Checkpoint[] = [];
    const observables = [];
    this.checkpoints.forEach(data => {
      if(data.imageFile) {
        let imageFile = this.convertToBlob(data.imageFile);
        observables.push(this.imageService.uploadImage(imageFile).pipe(map(uploaded => {
          data.checkpoint.imgUrl = uploaded.imageUrl;
          return data.checkpoint;
        })));
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

  canOpenCheckpointsEditor() {
    const pointOfDeparture = (this.gameForm.get('locationType').value === LocationType.location
      || this.gameForm.get('locationType').value === LocationType.description) && (this.gameForm.get('pointOfDeparture').value === null);
    return (this.gameForm.get('locationType').value === null || this.gameForm.get('quiz').value === null || pointOfDeparture);
  }

  openCheckpointsEditor() {
    this.router.navigate(['/', 'games', 'create-game', 'create-checkpoints'], {
      queryParams: {
        locationType: this.gameForm.value.locationType,
        quiz: this.gameForm.value.quiz,
        lat: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lat : null,
        lng: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lng : null,
        checkpoints: JSON.stringify(this.checkpoints)
      }
    });
  }

  selectCountry() {
    this.modalCtrl.create({ component: PickAThingComponent, componentProps: {
        countries: this.countries,
        selectedCountry: this.selectedCountry
      }}).then(modalEl => {
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

}
