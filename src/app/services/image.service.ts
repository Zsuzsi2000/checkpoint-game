import { Injectable } from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {switchMap, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, {type: contentType});
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          'https://us-central1-checkpoint-game-399d6.cloudfunctions.net/storeImage',
          uploadData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
      })
    );
  }

  convertbase64toBlob(imageData) {
    return base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
  }
}
