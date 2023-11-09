import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "../../../auth/auth.service";
import {take} from "rxjs/operators";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.scss'],
})
export class FavouriteComponent implements OnInit, OnDestroy {

  @Input() gameId: string;
  userId: string;
  favouriteGames: string[] = [];
  private favouritesSub: Subscription;


  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    this.favouritesSub = this.authService.user.subscribe(user => {
      console.log("user", user);
      if (user) {
        this.favouriteGames = user.favouriteGames;
        this.userId = user.id;
      } else {
        this.userId = null;
      }
    })
  }

  checkIsItFavourite(id: string): boolean {
    return this.favouriteGames.includes(id);
  }

  addToFavourites(gameId: string) {
    this.userService.updateUser(
      this.userId,
      null,
      null,
      null,
      null,
      gameId,
      true
    ).pipe(take(1)).subscribe();
  }

  deleteFromFavourites(gameId: string) {
    this.userService.updateUser(
      this.userId,
      null,
      null,
      null,
      null,
      gameId,
      false
    ).pipe(take(1)).subscribe();
  }

  ngOnDestroy(): void {
    if (this.favouritesSub) {
      this.favouritesSub.unsubscribe();
    }
  }

}
