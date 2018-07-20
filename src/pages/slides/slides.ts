import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { StoreProvider } from '../../providers/store/store';

import { TabsPage } from '../tabs/tabs';
import { LoginPage } from '../login/login';

/**
 * Generated class for the SlidesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-slides',
  templateUrl: 'slides.html',
})
export class SlidesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private store: StoreProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlidesPage');
  }

  startApp() {

    this.store.setKey('skipIntro',true);
    this.store.getKey('user').then((user) => {
      if (user) {
        this.navCtrl.setRoot(TabsPage);
      } else {
        this.navCtrl.setRoot(LoginPage);
      }
      this.navCtrl.popToRoot();
    });
  }

}
