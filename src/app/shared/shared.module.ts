import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ListOfUsersComponent} from './components/list-of-users/list-of-users.component';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {PickAThingComponent} from "./components/pick-a-thing/pick-a-thing.component";
import {CheckpointsEditorModalComponent} from "./maps/checkpoints-editor-modal/checkpoints-editor-modal.component";
import {LocationPickerComponent} from "./maps/location-picker/location-picker.component";
import {MapModalComponent} from "./maps/map-modal/map-modal.component";
import {IonicModule} from "@ionic/angular";



@NgModule({
  declarations: [
    ListOfUsersComponent,
    PickAThingComponent,
    CheckpointsEditorModalComponent,
    LocationPickerComponent,
    MapModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule,
    IonicModule
  ],
  exports: [
    ListOfUsersComponent,
    PickAThingComponent,
    Ng2SearchPipeModule,
    CheckpointsEditorModalComponent,
    LocationPickerComponent,
    MapModalComponent
  ]
})
export class SharedModule { }
