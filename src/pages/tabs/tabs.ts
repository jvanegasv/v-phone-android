import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user'

import { PhonePage } from '../phone/phone';
import { SmsPage } from './../sms/sms';
import { CallcdrPage } from '../callcdr/callcdr';
import { ContactsPage } from '../contacts/contacts';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root = PhonePage;
  tab2Root = SmsPage
  tab3Root = CallcdrPage;
  tab4Root = ContactsPage;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
