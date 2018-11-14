import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { UserProvider } from './../../providers/user/user';
import { SmsProvider } from './../../providers/sms/sms';

/**
 * Generated class for the SmsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sms',
  templateUrl: 'sms.html',
})
export class SmsPage {

  page = 0;
  smsSumary:any = [];

  constructor(
    public user: UserProvider,
    public _sms: SmsProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {

    this.loadsummary();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SmsPage');
  }

  async loadsummary() {

    if (this.page < 0) {
      return;
    }

    await this._sms.getSummary({username: this.user.userInfo.user_api_key, password: this.user.userInfo.user_api_pwd},{page: this.page})
    .then((result:any) => {

      if (result.length > 0) {
        this.page++;
      } else {
        this.page = -1;
      }

      result.forEach((message) => {
        let data = {
          country: '',
          cost: 0,
          direction: '',
          date: '',
          type: '',
          internal: '',
          external: '',
          msg: '',
          status: ''
        };
        data.country = 'https://voip-communications.net/countries-flags/' + message.sms_country + '.png';
        data.cost = (message.sms_sale * 1);
        data.direction = message.sms_inout;
        data.date = message.sms_status_date;
        data.type = message.sms_type;
        data.internal = message.sms_internal;
        data.external = message.sms_external;
        data.msg = message.sms_msg;
        data.status = message.sms_status;
        this.smsSumary.push(data);
      });
    })
    .catch();

  }

  newSms(){

    alert('New sms');

  }

  loadChat(phone){

    console.log('Loading chat with external phone: ', phone);

  }

}
