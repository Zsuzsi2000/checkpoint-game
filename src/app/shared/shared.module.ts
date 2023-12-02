import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {PickAThingComponent} from "./components/pick-a-thing/pick-a-thing.component";
import {LocationPickerComponent} from "./maps/location-picker/location-picker.component";
import {MapModalComponent} from "./maps/map-modal/map-modal.component";
import {IonicModule} from "@ionic/angular";
import {CheckpointEditorComponent} from "./components/checkpoint-editor/checkpoint-editor.component";
import {CheckpointsEditorComponent} from "./components/checkpoints-editor/checkpoints-editor.component";
import {ImagePickerComponent} from "./components/image-picker/image-picker.component";
import {ImagePickerModalComponent} from "./components/image-picker-modal/image-picker-modal.component"
import {CheckpointsMapModalComponent} from "./maps/checkpoints-map-modal/checkpoints-map-modal.component";
import {FavouriteComponent} from "./components/favourite/favourite.component";
import {PickThingsComponent} from "./components/pick-things/pick-things.component";
import {EventEditorComponent} from "./components/event-editor/event-editor.component";
import {SavedComponent} from "./components/saved/saved.component";
import {JoinOrCreateTeamComponent} from "./components/join-or-create-team/join-or-create-team.component";
import {EventCardComponent} from "./components/event-card/event-card.component";
import {ShareComponent} from "./components/share/share.component";
import {RouterModule} from "@angular/router";
import {GameCardComponent} from "./components/game-card/game-card.component";
import {QRCodeModule} from "angularx-qrcode";
import {TranslateModule} from "@ngx-translate/core";



@NgModule({
  declarations: [
    PickAThingComponent,
    LocationPickerComponent,
    MapModalComponent,
    CheckpointsEditorComponent,
    CheckpointEditorComponent,
    ImagePickerComponent,
    ImagePickerModalComponent,
    CheckpointsMapModalComponent,
    FavouriteComponent,
    PickThingsComponent,
    EventEditorComponent,
    SavedComponent,
    JoinOrCreateTeamComponent,
    EventCardComponent,
    GameCardComponent,
    ShareComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    IonicModule,
    RouterModule,
    QRCodeModule,
    TranslateModule
  ],
  exports: [
    PickAThingComponent,
    Ng2SearchPipeModule,
    LocationPickerComponent,
    MapModalComponent,
    CheckpointsEditorComponent,
    CheckpointEditorComponent,
    ImagePickerComponent,
    ImagePickerModalComponent,
    CheckpointsMapModalComponent,
    FavouriteComponent,
    PickThingsComponent,
    EventEditorComponent,
    SavedComponent,
    JoinOrCreateTeamComponent,
    EventCardComponent,
    GameCardComponent,
    ShareComponent
  ]
})
export class SharedModule { }
