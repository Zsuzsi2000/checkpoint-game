import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

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

  ngOnInit() {
    this.workingSelectedCountry = this.selectedCountry;
    console.log("countries", this.countries)

  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    this.selectionChange.emit(this.workingSelectedCountry);
  }

  checkboxChange(event) {
    console.log("checkboxChange", event)
    this.workingSelectedCountry = event.detail.value;
  }

}
