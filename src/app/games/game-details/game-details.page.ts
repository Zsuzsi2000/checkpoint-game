import {Component, OnDestroy, OnInit} from '@angular/core';
import {Game} from "../../models/game.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, ModalController, NavController} from "@ionic/angular";
import {GamesService} from "../games.service";
import {of, Subscription} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../models/user.model";
import {catchError, switchMap, take} from "rxjs/operators";
import {LocationType} from "../../enums/LocationType";
import {UserService} from "../../services/user.service";
import {jsPDF} from "jspdf";
import {Checkpoint} from "../../models/checkpoint.model";
import {LocationIdentification} from "../../enums/LocationIdentification";

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.page.html',
  styleUrls: ['./game-details.page.scss'],
})
export class GameDetailsPage implements OnInit, OnDestroy {

  game: Game;
  gameSub: Subscription;
  isLoading = false;
  user: User;
  creator: User;
  ownGame = false;
  LocationType = LocationType;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private gamesService: GamesService,
              private authService: AuthService,
              private userService: UserService,
              private alertController: AlertController,
              private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('gameId')) {
        this.navCtrl.pop();
      }
      this.isLoading = true;
      this.gamesService.fetchGame(paramMap.get('gameId')).pipe(
        take(1),
        catchError(error => {
          this.showALert();
          return of(null);
        }),
        switchMap(game => {
          if (game) {
            this.game = game;
            this.isLoading = false;
            return this.userService.getUserById(game.userId).pipe(take(1));
          } else {
            return of(null);
          }
        }),
        catchError(error => {
          return of(null);
        }),
        switchMap(user => {
          if (user) {
            this.creator = user;
            return this.authService.user.pipe(take(1));
          } else {
            return of(null);
          }
        })
      ).subscribe(user => {
        this.isLoading = false;
        if (user) {
          this.user = user;
          this.ownGame = (this.user.id === this.creator.id);
        }
      });
    });
  }

  navigate() {
    this.router.navigate(['/', 'events', 'create-event'], {
      queryParams: { gameId: this.game.id }
    });
  }

  showALert() {
    this.alertController
      .create(
        {
          header: 'An error occured',
          message: 'Game could not be fetched. Please try again later.',
          buttons: [{
            text: 'Okay', handler: () => {
              this.router.navigate(['/', 'games']);
            }
          }]
        })
      .then(alertEl => {
        alertEl.present();
      });
  }

  deleteGame(id: string) {
    this.alertController.create({
      header: "Delete game",
      message: "Are you sure you want to delete the game?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => {
            this.gamesService.deleteGame(id).subscribe(res => {
              this.router.navigate(['/', 'games']);
            });
          }
        }
      ]
    }).then(
      alertEl => alertEl.present()
    );
  }

  editGame(id: string) {
    this.router.navigate(['/', 'games', 'edit-game', id]);
  }

  navigateToGameMode() {
    this.router.navigate(['/', 'game-mode'], { queryParams: { gameId: this.game.id }});
  }

  ngOnDestroy(): void {
    if (this.gameSub) {
      this.gameSub.unsubscribe();
    }
  }

  getPdf() {
    if (this.game.locationIdentification === LocationIdentification.qr) {
      const promises = this.game.checkpoints.map(check => this.convertBlobToBase64(check));

      Promise.all(promises)
        .then(base64DataUrls => {
          console.log(base64DataUrls);
          this.generatePDFFromQRCodes(base64DataUrls);
        })
        .catch(error => {
          console.error('Error converting blobs to base64:', error);
          this.generatePDFFromAccessCodes();
        });
    } else {
      this.generatePDFFromAccessCodes();
    }
  }

  generatePDFFromQRCodes( checks: {checkpoint: Checkpoint, url: string}[]) {
    const pdf = new jsPDF('p', 'cm','a4');

    pdf.text(this.game.name, 2, 2);
    checks.forEach((check, index) => {
      if ( index > 0 && index % 4 === 0) { pdf.addPage() }
      pdf.text(check.checkpoint.index + '. ' + check.checkpoint.name, (index % 2 === 0) ? 2 : 10.5, (index % 4 === 0 || index % 4 === 1) ? 4 : 15);
      pdf.addImage(check.url, 'PNG', (index % 2 === 0) ? 2 : 10.5, (index % 4 === 0 || index % 4 === 1) ? 6 : 17, 7, 7);
    });

    pdf.save(this.game.name.replace(/\s/g, "") + '.pdf');
    console.log(pdf);
  }

  generatePDFFromAccessCodes() {
    const pdf = new jsPDF('p', 'cm','a4');

    pdf.text(this.game.name, 2, 2);
    this.game.checkpoints.forEach((check, index) => {
      if ( index > 0 && index % 20 === 0) { pdf.addPage() }
      pdf.text(check.index + '. ' + check.name + ': ' + check.locationAccessCode, 2, 3 + index);
    });

    pdf.save(this.game.name.replace(/\s/g, "") + '.pdf');
    console.log(pdf);
  }

  convertBlobToBase64(check: Checkpoint): Promise<{checkpoint: Checkpoint, url: string}> {
    return new Promise((resolve, reject) => {
      fetch(check.LocationQrCodeUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64DataUrl = reader.result as string;
            console.log(base64DataUrl);
            resolve({ checkpoint: check, url: base64DataUrl });
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => reject(`Error converting blob to base64 for ${check.name}: ${error}`));
    });
  }

}
