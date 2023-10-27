import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {IonModal} from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {

  @ViewChild('modal', {static: true}) modal!: IonModal;

  gameForm: FormGroup;
  categories: string[] = [ "Sport", "Music", "TV series and movies", "Culture", "Culture", "Logical"];
  countries = [];
  selectedCountry: string = "";

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
      hasALocation: new FormControl(null, { updateOn: "change" }),
      pointOfDeparture: new FormControl(null, { updateOn: "change" }),
      imgUrl: new FormControl(null, { updateOn: "change"}),
      distance: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      duration: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      itIsPublic: new FormControl(null, { updateOn: "change" }),
    })
  }

  creatGame() {
    console.log("game", this.gameForm);
    let category: string;
    if (this.gameForm.value.category === 'otherCategory') {
      category = this.gameForm.value.newCategory;
      //TODO: add new category
    } else {
      category = this.gameForm.value.category;
    }
    if (!this.gameForm.valid) {
      return;
    }
    this.gamesService.createGame(
      this.gameForm.value.name,
      this.gameForm.value.hasALocation,
      this.selectedCountry,
      this.gameForm.value.pointOfDeparture,
      category,
      this.gameForm.value.quiz === "quiz",
      this.gameForm.value.description,
      this.gameForm.value.imgUrl,
      this.gameForm.value.distance,
      this.gameForm.value.duration,
      this.gameForm.value.itIsPublic
    ).subscribe(game => {
      console.log("game", game);
      // this.router.navigate(['/','games', 'details' ])
      this.gameForm.reset();
    });
  }

  countrySelectionChanged(country: string) {
    console.log("countrySelectionChanged", country);
    this.selectedCountry = country;
    this.modal.dismiss();
  }

}
