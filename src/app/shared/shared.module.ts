import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ListOfUsersComponent} from './components/list-of-users/list-of-users.component';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {PickAThingComponent} from "./components/pick-a-thing/pick-a-thing.component";



@NgModule({
  declarations: [ ListOfUsersComponent, PickAThingComponent ],
  imports: [
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule
  ],
  exports: [ ListOfUsersComponent, PickAThingComponent, Ng2SearchPipeModule ]
})
export class SharedModule { }
