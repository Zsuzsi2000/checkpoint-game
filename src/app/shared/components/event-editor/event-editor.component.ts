import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LoadingController, ModalController} from "@ionic/angular";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ImageService} from "../../../services/image.service";
import {GameMode} from "../../../enums/GameMode";
import {Event} from "../../../models/event.model";
import {AuthService} from "../../../auth/auth.service";
import {catchError, switchMap, take} from "rxjs/operators";
import {LiveGameSettings} from "../../../models/liveGameSettings";
import {EventsService} from "../../../events/events.service";
import {of} from "rxjs";
import {ISODateString} from "@capacitor/core";


@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.scss'],
})
export class EventEditorComponent implements OnInit {

  @Input() gameId!: string;
  @Input() event: Event;
  @Output() done = new EventEmitter<any>();
  userId: string;
  imageFile: File;
  eventForm: FormGroup;
  defaultDate: string;
  today: string;
  GameMode = GameMode;
  actualGameMode: GameMode = GameMode.notSpecified;
  canEditGameMode = true;

  constructor(private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private formBuilder: FormBuilder,
              private authService: AuthService,
              private eventsService: EventsService,
              private imageService: ImageService) { }

  ngOnInit() {
    this.defaultDate = new Date().toISOString();
    this.today = new Date().toISOString();
    this.authService.userId.pipe(take(1)).subscribe(userid => this.userId = userid);
    if (this.event) {
      this.actualGameMode = this.event.liveGameSettings.gameMode;
      console.log(this.event);
      this.defaultDate = new Date(this.event.date).toISOString();
      if (this.event.joined && this.event.joined.length > 0) {
        this.canEditGameMode = false;
      }
      this.eventForm = this.formBuilder.group({
        name: new FormControl(this.event.name, { updateOn: "change", validators: [Validators.required]}),
        date: new FormControl(this.event.date, { updateOn: "change", validators: [Validators.required]}),
        isItPublic: new FormControl(this.event.isItPublic, { updateOn: "change"}),
        imgUrl: new FormControl(this.event.imgUrl, { updateOn: "change"}),
        description: new FormControl(this.event.description, { updateOn: "change"}),
        liveGameSettings: this.formBuilder.group({
          gameMode: new FormControl(this.event.liveGameSettings.gameMode, { updateOn: "change"}),
          maxTeam: new FormControl(this.event.liveGameSettings.maxTeam, { updateOn: "change",
            validators: [Validators.min(1), Validators.max(20)]}),
          maxTeamMember: new FormControl(this.event.liveGameSettings.maxTeamMember, { updateOn: "change",
            validators: [Validators.min(1), Validators.max(20)]}),
        }),
      });
    } else {
      this.eventForm = new FormGroup({
        name: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        date: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        isItPublic: new FormControl(null, { updateOn: "change"}),
        imgUrl: new FormControl(null, { updateOn: "change"}),
        description: new FormControl(null, { updateOn: "change"}),
        liveGameSettings: this.formBuilder.group({
          gameMode: new FormControl(null, { updateOn: "change"}),
          maxTeam: new FormControl(5, { updateOn: "change", validators: [Validators.min(1), Validators.max(20)]}),
          maxTeamMember: new FormControl(5, { updateOn: "change", validators: [Validators.min(1), Validators.max(20)]}),
        }),
      });
      this.eventForm.patchValue({ isItPublic: true });
    }
  }

  createEvent() {
    if (!this.eventForm.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating event...'
    }).then(loadingEl => {
      loadingEl.present();

      let liveGameSettings = this.canEditGameMode ? this.setLiveGameSettings() : this.setMax();
      let newEvent = new Event(
        (this.event) ? this.event.id : null,
        this.eventForm.value.name,
        this.eventForm.value.date,
        this.event ? (this.event.creationDate ? this.event.creationDate : new Date()) : new Date(),
        this.eventForm.value.isItPublic,
        this.eventForm.value.imgUrl,
        this.userId,
        this.gameId,
        this.eventForm.value.description,
        liveGameSettings,
        this.event ? this.event.players : [],
        this.event ? this.event.joined : [],
      );

      if (this.imageFile) {
        this.imageService.uploadImage(this.imageFile).pipe(
          catchError(error => {
            console.log('Error from uploadImages:', error);
            return of(null);
          }),
          switchMap(uploadResponse => {
            if (uploadResponse && uploadResponse.imageUrl) {
              newEvent.imgUrl = uploadResponse.imageUrl;
            }
            return (this.event) ? this.eventsService.updateEvent(newEvent) : this.eventsService.createEvent(newEvent);
          })).subscribe(res => {
          console.log(res);
          loadingEl.dismiss();
          this.done.emit(res);
        });
      } else {
        ((this.event) ? this.eventsService.updateEvent(newEvent) : this.eventsService.createEvent(newEvent)).subscribe(res => {
          console.log(res);
          loadingEl.dismiss();
          this.done.emit(res);
        });
      }
    });

  }

  onImagePick(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imageService.convertbase64toBlob(imageData);
      } catch (error) {
        console.log("error", error);
        return;
      }
    } else {
      imageFile = imageData
    }
    this.imageFile = imageFile;
  }

  setDate(event) {
    console.log(event, new Date(event.detail.value));
    this.eventForm.patchValue({ date: new Date(event.detail.value) });
  }

  setPublic(event) {
    console.log(event);
    this.eventForm.patchValue({ isItPublic: event.detail.value });
  }

  setGameMode(event) {
    console.log(event);
    this.eventForm.get('liveGameSettings').patchValue({ gameMode: +event.detail.value as GameMode });
    this.actualGameMode = +event.detail.value as GameMode;
    console.log(this.eventForm,this.actualGameMode )
  }

  setLiveGameSettings(): LiveGameSettings {
    let liveGameSettings = new LiveGameSettings();
    if (this.eventForm.get('liveGameSettings').value.gameMode) {
      let maxTeam = this.eventForm.get('liveGameSettings').value.maxTeam;
      let maxTeamMember = this.eventForm.get('liveGameSettings').value.maxTeamMember;
      if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.teamVsTeam) {
        liveGameSettings = new LiveGameSettings(GameMode.teamVsTeam, maxTeam ? maxTeam : 20, maxTeamMember ? maxTeamMember : 20);
      } else if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.teamGame) {
        liveGameSettings = new LiveGameSettings(GameMode.teamGame, 1, maxTeamMember ? maxTeamMember : 20);
      } else if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.againstEachOther) {
        liveGameSettings = new LiveGameSettings(GameMode.againstEachOther, maxTeam ? maxTeam : 20, 1);
      }
    }
    console.log(liveGameSettings);
    return liveGameSettings;
  }

  setMax(): LiveGameSettings {
    let live = this.event.liveGameSettings;
    if (this.eventForm.get('liveGameSettings').value.maxTeam) live.maxTeam = this.eventForm.get('liveGameSettings').value.maxTeam;
    if (this.eventForm.get('liveGameSettings').value.maxTeamMember) live.maxTeamMember = this.eventForm.get('liveGameSettings').value.maxTeamMember;
    return this.event.liveGameSettings;
  }

  showWarningMessage(maxTeam: boolean) {
    if (!this.canEditGameMode) {
      if (maxTeam) {
        return this.eventForm.get('liveGameSettings').value.maxTeam < this.event.liveGameSettings.maxTeam;
      } else {
        return this.eventForm.get('liveGameSettings').value.maxTeamMember < this.event.liveGameSettings.maxTeamMember;
      }
    } else { return false }
  }

}
