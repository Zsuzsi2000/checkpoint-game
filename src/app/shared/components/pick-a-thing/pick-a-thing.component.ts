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
  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string>();

  title = 'Select country';
  filter: string = "";
  workingSelectedCountry: string;

  constructor(private modalCtrl: ModalController) {}


  ngOnInit() {
    this.workingSelectedCountry = this.selectedCountry;
  }

  cancelChanges() {
    this.modalCtrl.dismiss();
    // this.selectionCancel.emit();
  }

  confirmChanges() {
    this.modalCtrl.dismiss(this.workingSelectedCountry)
    // this.selectionChange.emit(this.workingSelectedCountry);
  }

  checkboxChange(event) {
    console.log("checkboxChange", event)
    this.workingSelectedCountry = event.detail.value;
  }

}
