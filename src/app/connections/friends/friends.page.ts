import { Component, OnInit } from '@angular/core';
import {TypeOfListingUsers} from '../../enums/TypeOfListingUsers';
import {Friend} from '../../interfaces/Friend';
import {ConnectionsService} from '../connections.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {

  currentTypeOfListingUsers = TypeOfListingUsers.friends;
  friends: Friend[] = [];
  constructor(private connectionsService: ConnectionsService) { }

  ngOnInit() {
    this.friends = this.connectionsService.getFriends(0);
  }

}
