import {Component, Input, OnInit} from '@angular/core';
import {TypeOfListingUsers} from '../../../enums/TypeOfListingUsers';
import {Chat} from '../../../interfaces/Chat';
import {Friend} from '../../../interfaces/Friend';
import {ChatType} from '../../../enums/ChatType';

@Component({
  selector: 'app-list-of-users',
  templateUrl: './list-of-users.component.html',
  styleUrls: ['./list-of-users.component.scss'],
})
export class ListOfUsersComponent implements OnInit {

  @Input() currentTypeOfListingUsers: TypeOfListingUsers;
  @Input() list: Chat[] | Friend[]  = [];
  filter = '';
  chatType = ChatType;
  typeOfListingUsers = TypeOfListingUsers;
  constructor() { }

  ngOnInit() {}

}
