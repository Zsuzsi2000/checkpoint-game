import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatsPageRoutingModule } from './chats-routing.module';
import { ChatsPage } from './chats.page';
import {SharedModule} from '../../shared/shared.module';
import {TranslateModule} from "@ngx-translate/core";
import {CreateChatPage} from "./create-chat/create-chat.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatsPageRoutingModule,
    SharedModule,
    TranslateModule
  ],
    declarations: [
      ChatsPage,
      CreateChatPage
    ]
})
export class ChatsPageModule {}
