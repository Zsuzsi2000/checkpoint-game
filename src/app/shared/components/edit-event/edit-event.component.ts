import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ImageService} from "../../../services/image.service";
import {GameMode} from "../../../enums/GameMode";
import {Event} from "../../../models/event.model";
import {AuthService} from "../../../auth/auth.service";
import {catchError, switchMap, take} from "rxjs/operators";
import {LiveGameSettings} from "../../../models/liveGameSettings";
import {EventsService} from "../../../events/events.service";
import {of} from "rxjs";


@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
})
export class EditEventComponent implements OnInit {

  @Input() gameId!: string;
  @Input() event: Event;
  @Output() done = new EventEmitter<any>();
  userId: string;
  imageFile: File;
  eventForm: FormGroup;
  defaultDate: string;
  today: string;
  GameMode = GameMode;

  constructor(private modalCtrl: ModalController,
              private formBuilder: FormBuilder,
              private authService: AuthService,
              private eventsService: EventsService,
              private imageService: ImageService) { }

  ngOnInit() {
    this.defaultDate = new Date().toISOString();
    this.today = new Date().toISOString();
    this.authService.userId.pipe(take(1)).subscribe(userid => this.userId = userid);
    if (this.event) {
      this.defaultDate = this.event.date.toISOString();
      this.eventForm = this.formBuilder.group({
        name: new FormControl(this.event.name, { updateOn: "change", validators: [Validators.required]}),
        date: new FormControl(this.event.date, { updateOn: "change", validators: [Validators.required]}),
        isItPublic: new FormControl(this.event.isItPublic, { updateOn: "change", validators: [Validators.required]}),
        imgUrl: new FormControl(this.event.imgUrl, { updateOn: "change"}),
        description: new FormControl(this.event.description, { updateOn: "change"}),
        liveGameSettings: this.formBuilder.group({
          gameMode: new FormControl(this.event.liveGameSettings.gameMode, { updateOn: "change"}),
          maxTeam: new FormControl(this.event.liveGameSettings.maxTeam, { updateOn: "change"}),
          maxTeamMember: new FormControl(this.event.liveGameSettings.maxTeamMember, { updateOn: "change"}),
        }),
      });
    } else {
      this.eventForm = new FormGroup({
        name: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        date: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        isItPublic: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        imgUrl: new FormControl(null, { updateOn: "change"}),
        description: new FormControl(null, { updateOn: "change"}),
        liveGameSettings: this.formBuilder.group({
          gameMode: new FormControl(null, { updateOn: "change"}),
          maxTeam: new FormControl(null, { updateOn: "change"}),
          maxTeamMember: new FormControl(null, { updateOn: "change"}),
        }),
      });
    }
  }

  createEvent() {
    if (!this.eventForm.valid) {
      return;
    }

    let liveGameSettings = this.setLiveGameSettings();
    let newEvent = new Event(
      (this.event) ? this.event.id : null,
      this.eventForm.value.name,
      this.eventForm.value.date,
      this.eventForm.value.isItPublic,
      this.eventForm.value.imgUrl,
      this.userId,
      this.gameId,
      this.eventForm.value.description,
      liveGameSettings,
      (this.event) ? this.event.players : [],
      (this.event) ? this.event.joined : [],
      );

    if(this.imageFile) {
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
      });
    } else {
      ((this.event) ? this.eventsService.updateEvent(newEvent) : this.eventsService.createEvent(newEvent)).subscribe(res => {
        console.log(res);
        this.done.emit(res);
      });
    }

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

  setGameMode(event) {
    console.log(event);
    this.eventForm.get('liveGameSettings').patchValue({ gameMode: +event.detail.value as GameMode });
  }

  setLiveGameSettings(): LiveGameSettings {
    let liveGameSettings = new LiveGameSettings();
    if (this.eventForm.get('liveGameSettings').value.gameMode) {
      let maxTeam = this.eventForm.get('liveGameSettings').value.maxTeam;
      let maxTeamMember = this.eventForm.get('liveGameSettings').value.maxTeamMember;
      if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.teamVsTeam) {
        liveGameSettings = new LiveGameSettings(GameMode.teamVsTeam, maxTeam ? maxTeam : 20, maxTeamMember ? maxTeamMember : 20);
      } else if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.teamGame) {
        liveGameSettings = new LiveGameSettings(GameMode.teamVsTeam, 1, maxTeamMember ? maxTeamMember : 20);
      } else if (this.eventForm.get('liveGameSettings').value.gameMode === GameMode.againstEachOther) {
        liveGameSettings = new LiveGameSettings(GameMode.teamVsTeam, maxTeam ? maxTeam : 20, 1);
      }
    }
    return liveGameSettings;
  }

}
