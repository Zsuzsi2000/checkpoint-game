import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ListOfUsersComponent} from './components/list-of-users/list-of-users.component';
import {Ng2SearchPipeModule} from 'ng2-search-filter';



@NgModule({
  declarations: [ ListOfUsersComponent ],
  imports: [
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule
  ],
  exports: [ ListOfUsersComponent, Ng2SearchPipeModule ]
})
export class SharedModule { }
