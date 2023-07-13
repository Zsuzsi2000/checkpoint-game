import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public neptunId: string;
  public error = '';

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    switch (this.folder) {
      case 'Profile': this.folder = 'Profil'; break;
      case 'Events': this.folder = 'Események'; break;
      case 'Substitution': this.folder = 'Pótlás'; break;
      case 'SignIn': this.folder = 'Bejelentkezés'; break;
      case 'Regist': this.folder = 'Regisztráció'; break;
    }
  }
  signIn() {
    console.log(this.neptunId);
    if (this.neptunId==='IA1TS7') {
      this.folder = 'Események';
    } else {
      this.error = 'Rossz felhasználónév vagy jelszó!';
      this.neptunId = 'IA1TS7';
    }
  }

}
