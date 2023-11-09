import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Capacitor} from "@capacitor/core";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import {DataUrl, NgxImageCompressService, UploadResponse} from 'ngx-image-compress';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File | Blob>();
  @Input() showPreview = false;
  @Input() previewImage: string;
  selectedImage: string;
  usePicker = false;

  constructor(private platform: Platform, private imageCompress: NgxImageCompressService) {}

  ngOnInit() {
    this.selectedImage = this.previewImage;
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
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Camera.getPhoto({
      quality: 20,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 300,
      resultType: CameraResultType.DataUrl
    })
      .then(image => {
        console.warn(
          `Original: ${image.dataUrl.substring(0, 50)}... (${image.dataUrl.length} characters)`
        );
        console.warn('Size in bytes was:', this.imageCompress.byteCount(image.dataUrl));

        this.imageCompress
          .compressFile(image.dataUrl, -1, 50, 30)
          .then((result: DataUrl) => {
            console.warn(
              `Compressed: ${result.substring(0, 50)}... (${
                result.length
              } characters)`
            );
            console.warn(
              'Size in bytes is now:',
              this.imageCompress.byteCount(result)
            );
            this.selectedImage = result;
            this.imagePick.emit(result);

          });
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
    let result;

    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      console.warn(
        `Original: ${dataUrl.substring(0, 50)}... (${dataUrl.length} characters)`
      );
      console.warn('Size in bytes was:', this.imageCompress.byteCount(dataUrl));

      this.imageCompress
        .compressFile(dataUrl, -1, 50, 30)
        .then((result: DataUrl) => {
          console.warn(
            `Compressed: ${result.substring(0, 50)}... (${
              result.length
            } characters)`
          );
          console.warn(
            'Size in bytes is now:',
            this.imageCompress.byteCount(result)
          );
          console.log(result);
          this.selectedImage = result;
          this.imagePick.emit(result);

        });
    };
    fr.readAsDataURL(pickedFile);
  }

}
