import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ConnectionsService} from "../connections.service";
import {map, take} from "rxjs/operators";
import {Chat} from "../../models/chat.model";
import {TranslateService} from "@ngx-translate/core";
import {Message} from "../../interfaces/Message";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";
import {forkJoin} from "rxjs";
import {UserData} from "../../interfaces/UserData";
import { IonInfiniteScroll } from '@ionic/angular';

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
  chatMembers: UserData[] = [];
  scrollPosition: any = "";
  showedMessages: Message[] = [];
  firstTimestamp: Date;
  lastTimestamp: Date;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private translate: TranslateService,
              private connectionService: ConnectionsService,
              private userService: UserService,
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
            if (this.chat.message && this.chat.message.length > 0) {
              this.showedMessages = this.chat.message.slice(-6);
              this.firstTimestamp = this.showedMessages[this.showedMessages.length-1].timestamp;
              this.lastTimestamp = this.showedMessages[0].timestamp;
            }
            let observables = [];
            this.chat.participants.forEach(participant => {
              observables.push(this.userService.getUserById(participant).pipe(take(1), map(user => {
                  if (user) {
                    this.chatMembers.push(user);
                    return user;
                  }
              })));
            });

            forkJoin(observables).subscribe(users => {
              console.log(users);
            })
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

  goTo(text: string) {
    let url = text.slice(8);
    console.log(url);
    this.router.navigateByUrl(url);
  }

  isLink(text: string) {
    return text.startsWith('&#######');
  }

  loadMoreMessages(event: any) {
    let isScrollingDown = undefined;
    if (this.scrollPosition === "" && event.detail) {
      this.scrollPosition = event.detail.currentY;
    } else if (event.detail) {
      isScrollingDown = event.detail.currentY > this.scrollPosition;
    }

    if (isScrollingDown) {
      setTimeout(() => {
        let olders: Message[] = this.chat.message.filter(m => m.timestamp < this.firstTimestamp);
        console.log(olders);
        console.log(this.chat.message, olders, this.showedMessages);
        if (olders.length > 6) {
          this.showedMessages.unshift(...olders.slice(-6));
        } else {
          this.showedMessages.unshift(...olders);
        }
        console.log(this.chat.message, olders, this.showedMessages);
        this.firstTimestamp = this.showedMessages[this.showedMessages.length-1].timestamp;
        this.lastTimestamp = this.showedMessages[0].timestamp;
        (event.target as IonInfiniteScroll).complete();
      }, 1000);
    } else if (isScrollingDown !== undefined ){
      setTimeout(() => {
        let newers = this.chat.message.filter(m => m.timestamp > this.lastTimestamp);
        console.log(this.chat.message, newers, this.showedMessages);
        this.showedMessages.push(...newers);
        console.log(this.chat.message, newers, this.showedMessages);
        this.firstTimestamp = this.showedMessages[this.showedMessages.length-1].timestamp;
        this.lastTimestamp = this.showedMessages[0].timestamp;
        (event.target as IonInfiniteScroll).complete();
      }, 1000);
    }

    if (event.detail) {
      this.scrollPosition = event.detail.currentY;
    }
  }


}
