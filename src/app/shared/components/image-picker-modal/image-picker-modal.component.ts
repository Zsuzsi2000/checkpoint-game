import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-image-picker-modal',
  templateUrl: './image-picker-modal.component.html',
  styleUrls: ['./image-picker-modal.component.scss'],
})
export class ImagePickerModalComponent implements OnInit {

  @Input() loadedPicture: string;
  @Output() newImageSelected = new EventEmitter<string | File>();
  picture: string | File | Blob;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  cancelChanges() {
    this.modalCtrl.dismiss();
  }

  confirmChanges() {
    this.modalCtrl.dismiss(this.picture);
  }

  setPicture(picture: string | File | Blob) {
    this.picture = picture;
  }

}
