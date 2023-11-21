import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {ModalController} from "@ionic/angular";

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

  constructor(private modalCtrl: ModalController) {}


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
