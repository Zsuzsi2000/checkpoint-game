import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-pick-things',
  templateUrl: './pick-things.component.html',
  styleUrls: ['./pick-things.component.scss'],
})
export class PickThingsComponent implements OnInit {

  @Input() things: string[] = [];
  @Input() pickedThings: string[] = [];
  @Input() title: string;

  filter: string = "";
  workingPickedThings: string[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.workingPickedThings = this.pickedThings;
  }

  cancelChanges() {
    this.modalCtrl.dismiss();
  }

  confirmChanges() {
    this.modalCtrl.dismiss(this.workingPickedThings)
  }

  filtering(event) {
    this.filter = event.target.value;
    this.things.filter(g => this.filter === "" ? g : g.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  checkboxChange(event) {
    if (event.detail.checked) {
      this.workingPickedThings.push(event.detail.value);
    } else {
      this.workingPickedThings = this.workingPickedThings.filter( t => t !== event.detail.value);
    }
  }

}
