import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameModePageRoutingModule } from './game-mode-routing.module';
import { GameModePage } from './game-mode.page';
import {CreateMultiComponent} from "./create-multi/create-multi.component";
import {WaitingComponent} from "./waiting/waiting.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GameModePageRoutingModule,
        TranslateModule
    ],
    declarations: [
        GameModePage,
        CreateMultiComponent,
        WaitingComponent
    ]
})
export class GameModePageModule {}
