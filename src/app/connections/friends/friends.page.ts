import {Component, OnInit} from '@angular/core';
import {TypeOfListingUsers} from '../../enums/TypeOfListingUsers';
import {ConnectionsService} from '../connections.service';
import {UserData} from "../../interfaces/UserData";
import {AuthService} from "../../auth/auth.service";
import {take} from "rxjs/operators";
import {User} from "../../models/user.model";
import {ModalController} from "@ionic/angular";
import {NewPage} from "./new/new.page";
import {ChatType} from "../../enums/ChatType";
import {Chat} from "../../models/chat.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {

  currentTypeOfListingUsers = TypeOfListingUsers.friends;
  friends: UserData[] = [];
  filteredFriends: UserData[] = [];
  user: User;
  filter = "";
  constructor(private connectionsService: ConnectionsService,
              private authService: AuthService,
              private modalCtrl: ModalController,
              private router: Router) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.authService.user.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user = user;
        this.updateFriends();
      }
    })
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredFriends = this.friends.filter(g => this.filter === "" ? g : g.username.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  updateFriends() {
    this.connectionsService.getFriends(this.user.id).pipe(take(1)).subscribe(f => {
      this.friends = f;
    })
  }

  showOthers(isNew: boolean) {
    this.modalCtrl.create({ component: NewPage, componentProps: { isNew: isNew }}).then(modalEl => {
      modalEl.onDidDismiss().then(() => {
        this.updateFriends();
      });
      modalEl.present();
    })
  }

  deleteConnection(id: string) {
    this.connectionsService.getConnections(this.user.id).pipe(take(1)).subscribe(connections => {
      let connect = connections.find(c => (c.userOneId === id || c.userTwoId === id));
      if (connect !== undefined) {
        this.connectionsService.deleteConnection(connect.id).pipe(take(1)).subscribe(f => {
          console.log(f);
          this.updateFriends();
        });
      }
    });
  }

  goToChat(friend: UserData) {
    this.connectionsService.getChats(this.user.id).pipe(take(1)).subscribe(chats => {
      if (chats) {
        let chat = chats.find(chat => (chat.participants.includes(friend.id) && chat.type === ChatType.personal));
        if (chat === undefined) {
          let newChat = new Chat(null, friend.username, null, [this.user.id, friend.id],[], ChatType.personal);
          this.connectionsService.createChat(newChat).pipe(take(1)).subscribe(id => {
            this.router.navigate(['/', 'connections', 'tabs', 'chats', 'chat', id]);
          })
        } else {
          this.router.navigate(['/', 'connections', 'tabs', 'chats', 'chat', chat.id]);
        }
      }
    })
  }

}
