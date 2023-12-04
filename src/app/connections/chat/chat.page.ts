import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {
  AlertController,
  InfiniteScrollCustomEvent,
  IonContent,
  IonInput,
  ModalController,
  NavController
} from "@ionic/angular";
import {ConnectionsService} from "../connections.service";
import {map, switchMap, take} from "rxjs/operators";
import {Chat} from "../../models/chat.model";
import {TranslateService} from "@ngx-translate/core";
import {Message} from "../../interfaces/Message";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";
import {forkJoin, interval, Subscription} from "rxjs";
import {UserData} from "../../interfaces/UserData";
import {ChatType} from "../../enums/ChatType";
import {CreateChatPage} from "../chats/create-chat/create-chat.page";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, AfterViewInit {

  @ViewChild('content') content: IonContent;
  @ViewChild('textMessage') newMessage: IonInput;

  chatId: string;
  chat: Chat;
  currentLanguage = "";
  user: User;
  chatMembers: UserData[] = [];
  showedMessages: Message[] = [];
  firstTimestamp: Date;
  lastTimestamp: Date;
  chatSub: Subscription;
  first = false;
  ChatType = ChatType;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private translate: TranslateService,
              private connectionService: ConnectionsService,
              private userService: UserService,
              private authService: AuthService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
    this.authService.user.pipe(take(1)).subscribe(u => {
      if (u) {
        this.user = u;
      }
    })
  }

  ionViewWillEnter() {
    if (this.first) {
      this.chatSub = interval(5000).pipe(
        switchMap(() => {
          return this.connectionService.fetchChat(this.chatId).pipe(take(1));
        })
      ).subscribe((chat => {
        if (chat && chat != this.chat) {
          console.log(chat);
          this.updateChat(chat, false);
        }
      }));
    }
  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('chatId')) {
        this.navCtrl.pop();
      } else {
        this.chatId = paramMap.get('chatId');

        this.connectionService.fetchChat(this.chatId).pipe(take(1)).subscribe(chat => {
          if (chat) {
            this.first = true;
            this.updateChat(chat, true);
          }
        });

        this.chatSub = interval(5000).pipe(
          switchMap(() => {
            return this.connectionService.fetchChat(this.chatId).pipe(take(1));
          })
        ).subscribe((chat => {
          if (chat && chat != this.chat) {
            console.log(chat);
            this.updateChat(chat, false);
          }
        }));
      }
    });
  }

  updateChat(chat: Chat, first: boolean) {
    this.chat = chat;
    if (this.chat.message && this.chat.message.length > 0) {
      if (first) {
        if (this.chat.message.length > 10) {
          this.showedMessages = this.chat.message.slice(-10);
        } else {
          this.showedMessages = this.chat.message;
        }
        this.firstTimestamp = this.showedMessages[this.showedMessages.length - 1].timestamp;
        this.lastTimestamp = this.showedMessages[0].timestamp;
        this.content.scrollToBottom();
      } else {
        let newest: Message[] = this.chat.message.filter(m => m.timestamp > this.firstTimestamp);
        this.showedMessages.push(...newest);
        this.firstTimestamp = this.showedMessages[this.showedMessages.length - 1].timestamp;
      }
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

  settings() {
    let name = this.chat.name;
    if (this.chat.type === ChatType.personal) {
      let names = this.chat.name.split(';');
      name = (this.chat.participants[0] === this.user.id) ? names[names.length - 1] : names[0];
    }

    this.alertCtrl.create({
      header: "Set name",
      inputs: [{
        type: "text",
        name: "name",
        value: name
      }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Set new chat name",
          handler: (event) => {
            this.updateName(event.name);
          }
        },
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  addNewMember() {
    this.modalCtrl.create({ component: CreateChatPage, componentProps: { user: this.user, existingChat: this.chat} }).then(modalEl => {
      modalEl.onDidDismiss().then(data => {
        if (data.data) {
          console.log(data.data);
          this.connectionService.updateChat(data.data).pipe(take(1)).subscribe(ch => {
            console.log(ch);
          })
        }
      });
      modalEl.present();
    })
  }

  updateName(name: string) {
    let chatName = name;
    if (this.chat.type === ChatType.personal) {
      let names = this.chat.name.split(';');
      if (this.chat.participants[0] === this.user.id) {
        names[names.length - 1] = name;
      } else {
        names[0] = name;
      }
      chatName = names.join(';');
    }
    this.chat.name = chatName;
    this.connectionService.updateChat(this.chat).pipe(take(1)).subscribe(ch => {
      console.log(ch);
    })
  }

  sendMessage(data) {
    console.log(data);
    let message: Message = {
      text: data,
      user: this.user.id,
      timestamp: new Date()
    };
    this.chat.message.push(message);
    this.showedMessages.push(message);
    this.content.scrollToBottom();
    this.firstTimestamp = this.showedMessages[this.showedMessages.length - 1].timestamp;
    this.connectionService.updateChat(this.chat).pipe(take(1)).subscribe(ch => {
      console.log(ch);
      this.newMessage.value = "";
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
    if (event.target.scrollTop === 0) {
      console.log(event)
      let olders: Message[] = this.chat.message.filter(m => m.timestamp < this.lastTimestamp);
      console.log(olders);
      console.log(this.chat.message, olders, this.showedMessages);
      if (olders.length > 3) {
        this.showedMessages.unshift(...olders.slice(-3));
      } else {
        this.showedMessages.unshift(...olders);
      }
      console.log(this.chat.message, olders, this.showedMessages);
      this.lastTimestamp = this.showedMessages[0].timestamp;
    }
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 1000);
  }

  getChatName() {
    let name = this.chat.name;
    if (this.chat.type === ChatType.personal) {
      let names = this.chat.name.split(';');
      name = (this.chat.participants[0] === this.user.id) ? names[names.length - 1] : names[0];
    }
    return name;
  }

  getName(id: string) {
    if (this.chat.type === ChatType.personal) {
      let names = this.chat.name.split(';');
      return (this.chat.participants[0] === id) ? names[names.length - 1] : names[0];
    } else {
      let sender = this.chatMembers.find(member => member.id === id);
      return sender.username;
    }
  }

  getPicture(id: string) {
    let sender = this.chatMembers.find(member => member.id === id);
    return (sender && sender.picture) ? sender.picture : "https://ionicframework.com/docs/img/demos/avatar.svg";
  }

  ionViewDidLeave() {
    if (this.chatSub) this.chatSub.unsubscribe();
  }


}
