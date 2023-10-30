import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-checkpoints-editor-modal',
  templateUrl: './checkpoints-editor-modal.component.html',
  styleUrls: ['./checkpoints-editor-modal.component.scss'],
})
export class CheckpointsEditorModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  onCancel() {
    this.modalCtrl.dismiss();
  }

}
