import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  filter = '';
  chats = [
    { userName: 'Roli', type: 'personal' },
    { userName: 'Noémi', type: 'group' },
    { userName: 'Virág', type: 'eventGroup' },
  ]
  constructor() { }

  ngOnInit() {
  }

}
