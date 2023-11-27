import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ConnectionsService} from "../../connections.service";
import {take} from "rxjs/operators";
import {Chat} from "../../../models/chat.model";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatId: string;
  chat: Chat;

  constructor(private route: ActivatedRoute,
              private navCtrl: NavController,
              private connectionService: ConnectionsService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('chatId')) {
        this.navCtrl.pop();
      } else {
        this.chatId = paramMap.get('chatId');
        this.connectionService.fetchChat(this.chatId).pipe(take(1)).subscribe(chat => {
          if (chat) {
            this.chat = chat;
          }
        })
      }
    });
  }

}
