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



@NgModule({
  declarations: [
    ListOfUsersComponent,
    PickAThingComponent,
    LocationPickerComponent,
    MapModalComponent,
    CheckpointsEditorComponent,
    CheckpointEditorComponent
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
    CheckpointEditorComponent
  ]
})
export class SharedModule { }
