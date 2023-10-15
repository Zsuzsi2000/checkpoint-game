import {Component, OnInit} from '@angular/core';
import {ConnectionsService} from '../connections.service';
import {Chat} from '../../interfaces/Chat';
import {ChatType} from '../../enums/ChatType';
import {TypeOfListingUsers} from '../../enums/TypeOfListingUsers';
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  currentTypeOfListingUsers = TypeOfListingUsers.chats;
  chats: Chat[] = [];
  constructor(private connectionsService: ConnectionsService, private authService: AuthService) { }

  ngOnInit() {
    this.chats = this.connectionsService.getChats('0');
  }

  logout() {
    this.authService.logout();
  }

  deleteAccount() {
    this.authService.deleteAccount().subscribe(
      resData => {
        console.log("deleteAccount",resData);
      },
      errRes => {
        console.log("error", errRes.error.error.message);
      });;
  }

}
