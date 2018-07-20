import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhonesettingsPage } from './phonesettings';

@NgModule({
  declarations: [
    PhonesettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(PhonesettingsPage),
  ],
})
export class PhonesettingsPageModule {}
