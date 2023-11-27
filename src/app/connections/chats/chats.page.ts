import {Component, OnInit} from '@angular/core';
import {ConnectionsService} from '../connections.service';
import {Chat} from '../../models/chat.model';
import {ChatType} from '../../enums/ChatType';
import {TypeOfListingUsers} from '../../enums/TypeOfListingUsers';
import {AuthService} from "../../auth/auth.service";
import {take} from "rxjs/operators";
import {AlertController} from "@ionic/angular";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  currentTypeOfListingUsers = TypeOfListingUsers.chats;
  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  ChatType = ChatType;
  filter = "";
  user: User;

  constructor(private connectionsService: ConnectionsService,
              private authService: AuthService,
              private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.authService.user.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user = user;
        this.updateChats();
      }
    })
  }

  updateChats() {
    this.connectionsService.getChats(this.user.id).pipe(take(1)).subscribe(f => {
      this.chats = f;
      this.filteredChats = f;
    })
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredChats = this.chats.filter(g => this.filter === "" ? g : g.name.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  deleteChat(chat: Chat) {
    this.alertCtrl
      .create({
        header: 'Are you sure you want to delete your account?',
        message: 'The events and games you created will not be available.',
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Delete",
            role: "delete",
            handler: () => {
              this.delete(chat);
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }

  delete(chat: Chat) {
    if (chat.type === ChatType.personal) {
      this.connectionsService.deleteChat(chat.id).pipe(take(1)).subscribe(chat => {
        console.log(chat);
        this.updateChats();
      });
    } else {
      let updatedChat = chat;
      updatedChat.participants = updatedChat.participants.filter(user => this.user.id !== user);
      this.connectionsService.updateChat(updatedChat).pipe(take(1)).subscribe(chat => {
        console.log(chat);
        this.updateChats();
      })
    }

  }


}
