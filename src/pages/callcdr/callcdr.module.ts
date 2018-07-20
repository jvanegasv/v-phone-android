import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallcdrPage } from './callcdr';

@NgModule({
  declarations: [
    CallcdrPage,
  ],
  imports: [
    IonicPageModule.forChild(CallcdrPage),
  ],
})
export class CallcdrPageModule {}
