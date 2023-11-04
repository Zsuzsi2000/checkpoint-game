import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Capacitor} from "@capacitor/core";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  selectedImage: string;
  usePicker = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('iOS:', this.platform.is('ios'));
    console.log('Android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    console.log(Capacitor.isPluginAvailable('Camera'));
    if (!Capacitor.isPluginAvailable('Camera')) {
      console.log("click native");
      this.filePickerRef.nativeElement.click();
      return;
    }
    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      // height: 320,
      width: 300,
      resultType: CameraResultType.Base64
    })
      .then(image => {
        this.selectedImage = image.base64String;
        this.imagePick.emit(image.base64String);
      })
      .catch(error => {
        console.log(error);
        if (this.usePicker) {
          this.filePickerRef.nativeElement.click();
        }
        return false;
      });
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      console.log(event, pickedFile);
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }

}
