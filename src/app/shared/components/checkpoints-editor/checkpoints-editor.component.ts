import {Component, Input, OnInit} from '@angular/core';
import {Checkpoint} from "../../../models/checkpoint.model";
import {ItemReorderEventDetail, ModalController} from "@ionic/angular";
import {CheckpointEditorComponent} from "../checkpoint-editor/checkpoint-editor.component";
import {Game} from "../../../models/game.model";
import {LocationType} from "../../../enums/LocationType";
import {Coordinates} from "../../../interfaces/Location";


@Component({
  selector: 'app-checkpoints-editor',
  templateUrl: './checkpoints-editor.component.html',
  styleUrls: ['./checkpoints-editor.component.scss'],
})
export class CheckpointsEditorComponent implements OnInit {

  @Input() checkpoints: Checkpoint[] = [];
  @Input() center!: Coordinates;
  @Input() locationType!: LocationType;
  @Input() quiz!: boolean;
  reorderMode = false;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.center);
  }

  onCancel() {
    this.modalCtrl.dismiss(this.checkpoints);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.checkpoints = ev.detail.complete(this.checkpoints);
    this.checkpoints.forEach((checkpoint, index) => {
      checkpoint.index = index;
    })
  }

  reorder() {
    this.reorderMode = !this.reorderMode;
  }

  selectOnMap() {

  }

  addCheckpoint() {
    this.modalCtrl.create({
      component: CheckpointEditorComponent,
      componentProps: { locationType: this.locationType, isQuiz: this.quiz, center: this.center }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (modalData.data) {
          (modalData.data as Checkpoint).index = this.checkpoints.length;
          this.checkpoints.push(modalData.data);
        }
      });
      modalEl.present();
    })
  }

  editCheckpoint(editedCheckpoint: Checkpoint) {
    console.log(editedCheckpoint,"editedCheckpoint");
    this.modalCtrl.create({
      component: CheckpointEditorComponent,
      componentProps: { locationType: this.locationType, isQuiz: this.quiz, center: this.center, checkpoint: editedCheckpoint }
    }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        console.log(modalData.data);
        if (modalData.data) {
          this.checkpoints.find(checkpoint => checkpoint.index === editedCheckpoint.index);
          this.checkpoints.forEach(checkpoint => {
            if (checkpoint.index === editedCheckpoint.index) {
              checkpoint = modalData.data;
            }
          })
        }
      });
      modalEl.present();
    })
  }

  deleteCheckpoint(index: number) {
    this.checkpoints = this.checkpoints.filter(checkpoint => checkpoint.index != index);
  }

}
