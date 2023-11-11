import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ListOfUsersComponent} from './components/list-of-users/list-of-users.component';
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
import {EditEventComponent} from "./components/edit-event/edit-event.component";



@NgModule({
  declarations: [
    ListOfUsersComponent,
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
    EditEventComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    IonicModule
  ],
  exports: [
    ListOfUsersComponent,
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
    EditEventComponent
  ]
})
export class SharedModule { }
