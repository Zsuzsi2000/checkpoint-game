import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {UserData} from "../../../interfaces/UserData";
import {take} from "rxjs/operators";
import {User} from "../../../models/user.model";
import {ConnectionsService} from "../../connections.service";
import {Chat} from "../../../models/chat.model";
import {ChatType} from "../../../enums/ChatType";

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.page.html',
  styleUrls: ['./create-chat.page.scss'],
})
export class CreateChatPage implements OnInit {

  @Input() user: User;
  @Input() existingChat: Chat = null;
  filter = "";
  currentLanguage = "";
  friends: UserData[] = [];
  filteredFriends: UserData[] = [];
  chat: Chat;
  name: string = "";
  addedUsers: UserData[] = [];

  constructor(private modalCtrl: ModalController,
              private translate: TranslateService,
              private connectionsService: ConnectionsService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
    this.connectionsService.getFriends(this.user.id).pipe(take(1)).subscribe(f => {
      this.friends = (this.existingChat !== null) ? f.filter(friend => !this.existingChat.participants.includes(friend.id)) : f;
      this.filteredFriends = [...this.friends];
    });
    if (this.existingChat !== null) {
      this.chat = this.existingChat;
    } else {
      this.chat = new Chat(null, null, null, [this.user.id], [], ChatType.group)
    }

  }

  back() {
    this.modalCtrl.dismiss();
  }

  done() {
    this.chat.type = (this.chat.participants.length === 2) ? ChatType.personal : ChatType.group;
    this.chat.name = (this.chat.type === ChatType.personal) ? (this.user.username + ';' + this.addedUsers[0].username) : this.name;
    this.connectionsService.createChat(this.chat).pipe(take(1)).subscribe(id => {
      this.modalCtrl.dismiss(id);
    });
  }

  canCreate() {
    return (this.chat.participants.length === 2 || (this.chat.participants.length > 2 && this.name !== ""));
  }

  canAdd(id: string) {
    return this.addedUsers.find(user => user.id === id) !== undefined;
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredFriends = this.friends.filter(g => this.filter === "" ? g : g.username.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  addToChat(friend: UserData) {
    if (this.existingChat !== null) {
      this.chat.participants.push(friend.id);
      this.modalCtrl.dismiss(this.chat);
    } else {
      this.chat.participants.push(friend.id);
      this.addedUsers.push(friend);
    }
  }

  deleteFromAdded(id: string) {
    this.chat.participants = this.chat.participants.filter(p => p != id);
    this.addedUsers = this.addedUsers.filter(u => u.id !== id);
  }

}
