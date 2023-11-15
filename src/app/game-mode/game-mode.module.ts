import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameModePageRoutingModule } from './game-mode-routing.module';
import { GameModePage } from './game-mode.page';
import {QrCodeScannerComponent} from "./qr-code-scanner/qr-code-scanner.component";
import {CreateMultiComponent} from "./create-multi/create-multi.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameModePageRoutingModule
  ],
  declarations: [
    GameModePage,
    QrCodeScannerComponent,
    CreateMultiComponent
  ]
})
export class GameModePageModule {}
