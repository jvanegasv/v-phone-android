import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user';

/**
 * Generated class for the PhonesettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-phonesettings',
  templateUrl: 'phonesettings.html',
})
export class PhonesettingsPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhonesettingsPage');
  }

}
