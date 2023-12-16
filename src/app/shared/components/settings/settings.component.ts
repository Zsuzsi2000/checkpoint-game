import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../../auth/auth.service";
import {ModalController} from "@ionic/angular";
import {take} from "rxjs/operators";
import {UserService} from "../../../services/user.service";
import {Permissions} from "../../../interfaces/UserData";
import {User} from "../../../models/user.model";
import {pipe} from "rxjs";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  @Input() user: User;
  permissions: Permissions;
  currentLanguage: string;

  constructor(private translate: TranslateService,
              private authService: AuthService,
              private userService: UserService,
              private modalCtrl: ModalController) {
    this.currentLanguage = this.translate.currentLang;
  }

  ngOnInit() {
    if (this.user) {
      this.permissions = this.user.permissions;
    }
  }

  back() {
    if (this.user && this.permissions !== this.user.permissions) {
      this.userService.updateUser(
        this.user.id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        this.permissions
      ).pipe(take(1)).subscribe((g) => {
        this.modalCtrl.dismiss();
      });
    } else {
      this.modalCtrl.dismiss();
    }
  }

  switchLanguage(event) {
    this.translate.use(event.detail.value);
    this.currentLanguage = this.translate.currentLang;
  }

  changePermission(permission: string, event) {
    if (permission == "message") {
      this.permissions.message = event.detail.checked;
    } else if (permission == "friendRequests") {
      this.permissions.friendRequests = event.detail.checked;
    } else {
      this.permissions.eventReminder = event.detail.checked;
    }
  }

  logout() {
    this.authService.logout();
  }

}
