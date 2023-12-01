import {Component, Input, OnInit} from '@angular/core';
import {TypeOfListingUsers} from '../../../enums/TypeOfListingUsers';
import {User} from '../../../models/user.model';
import {Request} from '../../../models/request.model';
import {ConnectionsService} from '../../connections.service';
import {switchMap, take} from "rxjs/operators";
import {UserData} from "../../../interfaces/UserData";
import {AuthService} from "../../../auth/auth.service";
import {forkJoin, of, Subscription} from "rxjs";
import {Connection} from "../../../models/connection.model";
import {ModalController} from "@ionic/angular";
import {UserService} from "../../../services/user.service";
import {Event} from "../../../models/event.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-new',
  templateUrl: './new.page.html',
  styleUrls: ['./new.page.scss'],
})
export class NewPage implements OnInit {

  @Input() isNew: boolean;
  filter = '';
  user: User;
  currentTypeOfListingUsers = TypeOfListingUsers.newFriends;
  unknownUsers: { user: UserData, marked: string }[] = [];
  filteredUsers: { user: UserData, marked: string }[] = [];
  ownRequests: Request[] = [];
  requestsSub: Subscription;
  connectionsSub: Subscription;
  currentLanguage = "";


  constructor(private connectionsService: ConnectionsService,
              private authService: AuthService,
              private userService: UserService,
              private modalCtrl: ModalController,
              private translate: TranslateService) {
    this.currentLanguage = translate.currentLang;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.authService.user.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user = user;
        this.updateList();
      }
    });
  }

  updateList() {
    if (this.isNew) {
      this.connectionsService.getUsersWithoutFriends(this.user.id).pipe(take(1)).subscribe((f: UserData[]) => {
        console.log("UserData", f);

        this.unknownUsers = f.map(user => {
          return { user: user, marked: "none" };
        });
        this.filteredUsers = [...this.unknownUsers];
        console.log("filteredUsers", this.filteredUsers);
        this.updateMarker();
      });
    } else {
      this.setRequests();
    }
  }

  setRequests() {
    this.connectionsService.getRequests(this.user.id).pipe(take(1)).subscribe(requests => {
      this.ownRequests = requests ? requests : [];
      if (this.ownRequests.length === 0) {
        this.unknownUsers = [];
        this.filteredUsers = [];
      }

      console.log("UserData", requests);
      let observables = [];
      requests.forEach(request => {
        if (request.receiverId === this.user.id ) {
          observables.push(this.userService.getUserById(request.senderId).pipe(
            take(1),
            switchMap(user => {
              return of({ user: user, marked: "receiver"})
            })
          ));
        } else if (request.senderId === this.user.id) {
          observables.push(this.userService.getUserById(request.receiverId).pipe(
            take(1),
            switchMap(user => {
              return of({ user: user, marked: "sender"})
            })
          ));
        }
      });

      forkJoin(observables).subscribe(users => {
        if (users) {
          console.log(users);
          this.unknownUsers = users as { user: UserData, marked: string }[];
          this.filteredUsers = [...this.unknownUsers];
          console.log("filteredUsers", this.filteredUsers);
        }
      });
    });
  }

  updateMarker() {
    this.connectionsService.getRequests(this.user.id).pipe(take(1)).subscribe(req => {
      this.ownRequests = req ? req : [];
      console.log("ownRequests");

      this.unknownUsers = this.unknownUsers.map(user => {
        let request = this.ownRequests.find(req => req.receiverId === user.user.id || req.senderId === user.user.id);
        let marked = request === undefined ? "none" : (request.senderId === this.user.id ? "sender" : "receiver");
        return { user: user.user, marked: marked };
      });
      this.filteredUsers = [...this.unknownUsers];
    });
  }

  filtering(event) {
    this.filter = event.target.value;
    this.filteredUsers = this.unknownUsers.filter(g => this.filter === "" ? g : g.user.username.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()));
  }

  createRequest(requestedUserId: string) {
    let request = new Request(null, this.user.id, requestedUserId);
    this.connectionsService.createRequest(request).pipe(take(1)).subscribe(f => {
      console.log(f);
      if (this.isNew) {
        this.updateMarker();
      } else {
        this.setRequests();
      }
    });
  }

  deleteRequest(requestedUserId: string) {
    let request = this.ownRequests.find(req => ((req.senderId === this.user.id ) || (req.senderId === requestedUserId))
      && ((req.receiverId === this.user.id) || (req.receiverId === requestedUserId)));
    this.connectionsService.deleteRequest(request.id).pipe(take(1)).subscribe(f => {
      console.log(f);
      if (this.isNew) {
        this.updateMarker();
      } else {
        this.setRequests();
      }
    });
  }

  confirmRequest(requestedUserId: string) {
    let request = this.ownRequests.find(req => req.receiverId === requestedUserId || req.senderId === requestedUserId);
    let connection = new Connection(null, request.senderId, request.receiverId);
    this.connectionsService.deleteRequest(request.id).pipe(
      take(1),
      switchMap(() => {
        return this.connectionsService.createConnection(connection);
      }),
      take(1)
    ).subscribe(f => {
      console.log(f);
      this.updateList();
    });
  }

  back() {
    this.modalCtrl.dismiss();
  }

  ionViewWillLeave() {
    if (this.requestsSub) {
      this.requestsSub.unsubscribe();
    }
    if (this.connectionsSub) {
      this.connectionsSub.unsubscribe();
    }
  }

}
