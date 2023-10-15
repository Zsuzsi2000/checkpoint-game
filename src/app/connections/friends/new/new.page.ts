import { Component, OnInit } from '@angular/core';
import {TypeOfListingUsers} from '../../../enums/TypeOfListingUsers';
import {User} from '../../../interfaces/User';
import {ConnectionsService} from '../../connections.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.page.html',
  styleUrls: ['./new.page.scss'],
})
export class NewPage implements OnInit {

  currentTypeOfListingUsers = TypeOfListingUsers.newFriends;
  users: User[] = [];
  constructor(private connectionsService: ConnectionsService) { }

  ngOnInit() {
    this.users = this.connectionsService.getUsersWithoutFriends('');
  }

}
