import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {IonModal} from "@ionic/angular";
import {Router} from "@angular/router";
import {take} from "rxjs/operators";
import { Location } from "../../interfaces/Location";
import { LocationType } from "../../enums/LocationType";
import { LocationIdentification } from "../../enums/LocationIdentification";
import {Game} from "../../models/game.model";

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {

  @ViewChild('modal') modal!: IonModal;

  gameForm: FormGroup;
  categories: {id: string, name: string}[];
  countries = [];
  selectedCountry: string = "";
  LocationType = LocationType;
  LocationIdentification = LocationIdentification;
  checkpointsReady = false;

  constructor(private gamesService: GamesService,
              private countryService: CountryService,
              private router: Router) { }

  ngOnInit() {
    this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    this.gameForm = new FormGroup({
      name: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      category: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      newCategory: new FormControl(null, { updateOn: "change" }),
      description: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      quiz: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      locationType: new FormControl(null, { updateOn: "change", validators: [Validators.required] }),
      locationIdentification: new FormControl(null, { updateOn: "change" }),
      pointOfDeparture: new FormControl(null, { updateOn: "change" }),
      imgUrl: new FormControl(null, { updateOn: "change"}),
      distance: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      duration: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      itIsPublic: new FormControl(null, { updateOn: "change" }),
    });
    this.gamesService.fetchCategories().pipe(take(1)).subscribe(categories => {
      if (categories) {
        this.categories = categories;
        console.log(this.categories, this.categories[0].name)
      }
    })
  }

  createGame() {
    console.log("game", this.gameForm);
    let category = (this.gameForm.value.category === 'otherCategory')
      ? this.gameForm.value.newCategory
      : this.gameForm.value.category;

    if (this.gameForm.value.locationType === LocationType.location) {
      this.gameForm.patchValue({ locationIdentification: LocationIdentification.locator });
    }

    if (!this.gameForm.valid) {
      return;
    }
    this.gamesService.createGame(
      this.gameForm.value.name,
      this.gameForm.value.locationType,
      this.gameForm.value.locationIdentification,
      this.selectedCountry,
      this.gameForm.value.pointOfDeparture,
      category,
      this.gameForm.value.quiz,
      this.gameForm.value.description,
      this.gameForm.value.imgUrl,
      this.gameForm.value.distance,
      this.gameForm.value.duration,
      this.gameForm.value.itIsPublic
    ).subscribe(gameId => {
      console.log("game", gameId);
      if (this.categories.find(c => c.name === category) === null) {
        this.gamesService.createCategory(category).subscribe(categories => {
          console.log("categories", categories);
          this.categories = categories;
        });
      }
      this.router.navigate(['/','games', 'details', gameId]);
      this.gameForm.reset();
    });
  }

  canOpenCheckpointsEditor() {
    const pointOfDeparture = (this.gameForm.get('locationType').value === LocationType.location
      || this.gameForm.get('locationType').value === LocationType.description) && (this.gameForm.get('pointOfDeparture').value === null);
    return (this.gameForm.get('locationType').value === null || this.gameForm.get('quiz').value === null || pointOfDeparture);
  }

  openCheckpointsEditor() {
    this.router.navigate(['/', 'games', 'create-game', 'create-checkpoints'], { queryParams: {
      locationType: this.gameForm.value.locationType,
      quiz: this.gameForm.value.quiz,
      lat: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lat : null,
      lng: (this.gameForm.value.pointOfDeparture) ? this.gameForm.value.pointOfDeparture.lng : null,
    }});
    console.log("open", this.gameForm.value.locationType, this.gameForm.value.quiz, this.gameForm.value.pointOfDeparture);
  }

  countrySelectionChanged(country: string) {
    console.log("countrySelectionChanged", country);
    this.selectedCountry = country;
    this.modal.dismiss();
  }

  onLocationPicked(location: Location) {
    this.gameForm.patchValue({ pointOfDeparture: location })
  }

}
