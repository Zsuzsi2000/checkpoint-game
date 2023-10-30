import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {GamesService} from "../games.service";
import {CountryService} from "../../services/country.service";
import {IonModal, ModalController} from "@ionic/angular";
import {Router} from "@angular/router";
import {take} from "rxjs/operators";
import {CheckpointsEditorModalComponent} from "../../shared/maps/checkpoints-editor-modal/checkpoints-editor-modal.component";
import { Location } from "../../interfaces/Location";
import {MapModalComponent} from "../../shared/maps/map-modal/map-modal.component";

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
  checkpointsReady = false;

  constructor(private gamesService: GamesService,
              private countryService: CountryService,
              private router: Router,
              private modalCtrl: ModalController) { }

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
    let category: string;
    if (this.gameForm.value.category === 'otherCategory') {
      category = this.gameForm.value.newCategory;
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
      this.gameForm.value.quiz,
      this.gameForm.value.description,
      this.gameForm.value.imgUrl,
      this.gameForm.value.distance,
      this.gameForm.value.duration,
      this.gameForm.value.itIsPublic
    ).subscribe(gameId => {
      console.log("game", gameId);
      this.gamesService.createCategory(category).subscribe(categories => {
        console.log("categories", categories);
        this.categories = categories;
        this.router.navigate(['/','games', 'details', gameId]);
        this.gameForm.reset();
      });
    });
  }

  countrySelectionChanged(country: string) {
    console.log("countrySelectionChanged", country);
    this.selectedCountry = country;
    this.modal.dismiss();
  }

  openCheckpointsEditor() {
    this.modalCtrl.create({ component: CheckpointsEditorModalComponent}).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
      });
      modalEl.present();
    })
  }

  onLocationPicked(location: Location) {
    this.gameForm.patchValue({ pointOfDeparture: location })
  }

}
