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
      this.friends = f;
      this.filteredFriends = [...f];
    });
    this.chat = new Chat(null, null, null, [this.user.id], [], ChatType.group)
  }

  back() {
    this.modalCtrl.dismiss();
  }

  done() {
    this.chat.type = (this.chat.participants.length === 2) ? ChatType.personal : ChatType.group;
    this.chat.name = this.name;
    this.connectionsService.createChat(this.chat).subscribe(id => {
      this.modalCtrl.dismiss(id);
    });
  }

  canCreate() {
    return this.chat.participants.length > 1 && this.name !== "";
  }

  canAdd(id: string) {
    return this.addedUsers.find(user => user.id === id) !== undefined;
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredFriends = this.friends.filter(g => this.filter === "" ? g : g.username.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  addToChat(friend: UserData) {
    this.chat.participants.push(friend.id);
    this.addedUsers.push(friend);
  }

  deleteFromAdded(id: string) {
    this.chat.participants = this.chat.participants.filter(p => p != id);
    this.addedUsers = this.addedUsers.filter(u => u.id !== id);
  }

}
