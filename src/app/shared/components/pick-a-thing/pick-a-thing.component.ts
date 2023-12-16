import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-pick-a-thing',
  templateUrl: './pick-a-thing.component.html',
  styleUrls: ['./pick-a-thing.component.scss'],
})
export class PickAThingComponent implements OnInit {

  @Input() countries: string[] = [];
  @Input() selectedCountry: string = "";

  title = 'Select country';
  filter: string = "";
  workingSelectedCountry: string;
  currentLanguage = "";

  constructor(private modalCtrl: ModalController,
              private translate: TranslateService) {
    this.currentLanguage = translate.currentLang;
    this.title = this.currentLanguage === 'hu' ? 'Ország kiválasztása' : 'Select country';
  }


  ngOnInit() {
    this.workingSelectedCountry = this.selectedCountry;
  }

  cancelChanges() {
    this.modalCtrl.dismiss();
  }

  filtering(event) {
    this.filter = event.target.value;
    this.countries = this.countries.filter(g => this.filter === "" ? g : g.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  confirmChanges() {
    this.modalCtrl.dismiss(this.workingSelectedCountry)
  }

  checkboxChange(event) {
    this.workingSelectedCountry = event.detail.value;
  }

}
