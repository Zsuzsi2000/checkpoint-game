import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {IonModal} from "@ionic/angular";

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

  constructor(private gamesService: GamesService, private countryService: CountryService) { }

  ngOnInit() {
    this.countries = ["1", "2", "3", "4", "5", "6", "7"];
    this.gameForm = new FormGroup({
      name: new FormControl(null, { updateOn: "blur", validators: [Validators.required]}),
      category: new FormControl(null, { updateOn: "blur", validators: [Validators.required]}),
      description: new FormControl(null, { updateOn: "blur", validators: [Validators.required]}),
      quiz: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
      hasALocation: new FormControl(null, { updateOn: "change" }),
      pointOfDeparture: new FormControl(null, { updateOn: "blur" }),
      imgUrl: new FormControl(null, { updateOn: "blur"}),
      distance: new FormControl(null, { updateOn: "blur", validators: [Validators.required]}),
      duration: new FormControl(null, { updateOn: "blur", validators: [Validators.required]}),
      itIsPublic: new FormControl(null, { updateOn: "change" }),
    })
  }

  creatGame() {
    console.log("game", this.gameForm);
    if (!this.gameForm.valid) {
      return;
    }
    this.gamesService.addGame(
      this.gameForm.value.name,
      this.selectedCountry,
      this.gameForm.value.pointOfDeparture,
      this.gameForm.value.category,
      this.gameForm.value.quiz === "quiz",
      this.gameForm.value.description,
      this.gameForm.value.imgUrl,
      this.gameForm.value.distance,
      this.gameForm.value.duration,
      this.gameForm.value.itIsPublic === "true"
    );
    // this.gameForm.reset();
  }

  countrySelectionChanged(country: string) {
    console.log("countrySelectionChanged", country);
    this.selectedCountry = country;
    this.modal.dismiss();
  }

}
