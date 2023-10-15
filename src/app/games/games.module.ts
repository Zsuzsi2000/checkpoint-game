import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GamesPageRoutingModule } from './games-routing.module';
import { GamesPage } from './games.page';
import {Ng2SearchPipeModule} from "ng2-search-filter";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamesPageRoutingModule,
    Ng2SearchPipeModule
  ],
  declarations: [GamesPage]
})
export class GamesPageModule {}
