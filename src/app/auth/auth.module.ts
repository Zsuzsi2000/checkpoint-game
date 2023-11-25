import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthPageRoutingModule } from './auth-routing.module';
import { AuthPage } from './auth.page';
import {SignupComponent} from "./signup/signup.component";
import {LoginComponent} from "./login/login.component";
import {Ng2SearchPipeModule} from "ng2-search-filter";
import {SharedModule} from "../shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthPageRoutingModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [
    AuthPage,
    SignupComponent,
    LoginComponent
  ],
  exports: [
    Ng2SearchPipeModule
  ]
})
export class AuthPageModule {}
