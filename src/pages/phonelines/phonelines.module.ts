import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhonelinesPage } from './phonelines';

@NgModule({
  declarations: [
    PhonelinesPage,
  ],
  imports: [
    IonicPageModule.forChild(PhonelinesPage),
  ],
})
export class PhonelinesPageModule {}
