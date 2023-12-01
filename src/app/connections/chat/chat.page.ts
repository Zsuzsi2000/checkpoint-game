import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ConnectionsService} from "../connections.service";
import {take} from "rxjs/operators";
import {Chat} from "../../models/chat.model";
import {TranslateService} from "@ngx-translate/core";
import {Message} from "../../interfaces/Message";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatId: string;
  chat: Chat;
  currentLanguage = "";
  user: User;

  constructor(private route: ActivatedRoute,
              private navCtrl: NavController,
              private translate: TranslateService,
              private connectionService: ConnectionsService,
              private authService: AuthService) {
    this.currentLanguage = translate.currentLang;
  }

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
    this.authService.user.pipe(take(1)).subscribe(u => {
      if (u) {
        this.user = u;
      }
    })
  }

  settings() {
    // change chat name
    // add chat member => group
  }

  sendMessage(data) {
    console.log(data);
    let message: Message = {
      text: data,
      user: this.user.id,
      timestamp: new Date()
    };
    this.chat.message.push(message);
    this.connectionService.updateChat(this.chat).pipe(take(1)).subscribe(ch => {
      console.log(ch);
    })
  }

}
