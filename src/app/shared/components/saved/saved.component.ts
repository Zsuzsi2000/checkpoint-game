import {Component, Input, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "../../../auth/auth.service";
import {UserService} from "../../../services/user.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss'],
})
export class SavedComponent implements OnInit {

  @Input() eventId: string;
  userId: string;
  savedEvents: string[] = [];
  private savedSub: Subscription;


  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    this.savedSub = this.authService.user.subscribe(user => {
      if (user) {
        this.savedEvents = user.savedEvents;
        this.userId = user.id;
      } else {
        this.userId = null;
      }
    })
  }

  checkIsItSaved(): boolean {
    return this.savedEvents.includes(this.eventId);
  }

  addToSavedEvents() {
    this.userService.updateUser(
      this.userId,
      null,
      null,
      null,
      null,
      null,
      null,
      this.eventId,
      null,
      true
    ).pipe(take(1)).subscribe();
  }

  deleteFromSavedEvents() {
    this.userService.updateUser(
      this.userId,
      null,
      null,
      null,
      null,
      null,
      null,
      this.eventId,
      null,
      false
    ).pipe(take(1)).subscribe();
  }

  ngOnDestroy(): void {
    if (this.savedSub) {
      this.savedSub.unsubscribe();
    }
  }

}
