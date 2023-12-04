import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {ConnectionsService} from "../../../connections/connections.service";
import {take} from "rxjs/operators";
import {Chat} from "../../../models/chat.model";
import {ChatType} from "../../../enums/ChatType";
import {Event} from "../../../models/event.model";
import {Game} from "../../../models/game.model";
import {User} from "../../../models/user.model";
import {Message} from "../../../interfaces/Message";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {

  @Input() event: Event;
  @Input() game: Game;
  @Input() user: User;
  @Input() accessCode: string;

  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  ChatType = ChatType;
  filter = "";
  currentLanguage = "";

  constructor(private modalCtrl: ModalController,
              private connectionsService: ConnectionsService,
              private translate: TranslateService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
    this.connectionsService.getChats(this.user.id).pipe(take(1)).subscribe(f => {
      this.chats = f;
      this.filteredChats = f;
    })
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredChats = this.chats.filter(g => this.filter === "" ? g : g.name.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  back() {
    this.modalCtrl.dismiss();
  }

  select(chat: Chat) {
    let text = "";
    if (this.accessCode) {
      text = 'Accesscode: ' + this.accessCode;
    } else if (this.event) {
      text = '&#######/events/details/' + this.event.id;
    } else {
      text = '&#######/games/details/' + this.game.id;
    }
    console.log(text);
    let newMessage: Message = {
      text: text,
      user: this.user.id,
      timestamp: new Date()
    };
    chat.message.push(newMessage);
    this.connectionsService.updateChat(chat).pipe(take(1)).subscribe(id => {
      id ? this.modalCtrl.dismiss(chat.id) : this.modalCtrl.dismiss();
    });
  }

  getChatName(chat: Chat) {
    let name = chat.name;
    if (chat.type === ChatType.personal) {
      let names = chat.name.split(';');
      name = (chat.participants[0] === this.user.id) ? names[names.length - 1] : names[0];
    }
    return name;
  }

}
