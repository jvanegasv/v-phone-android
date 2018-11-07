import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChkratesPage } from './chkrates';

@NgModule({
  declarations: [
    ChkratesPage,
  ],
  imports: [
    IonicPageModule.forChild(ChkratesPage),
  ],
})
export class ChkratesPageModule {}
