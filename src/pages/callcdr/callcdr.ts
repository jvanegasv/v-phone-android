import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user';
import { PhoneProvider } from '../../providers/phone/phone';

/**
 * Generated class for the CallcdrPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-callcdr',
  templateUrl: 'callcdr.html',
})
export class CallcdrPage {

  cdr:any = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider,
    public phone: PhoneProvider,
    public event: Events) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CallcdrPage');
    this.callCdr();
  }

  callCdr() {

    this.phone.callCdr({username: this.user.userInfo.user_api_key, password: this.user.userInfo.user_api_pwd},{})
    .then((result:any) => {
      result.forEach((pcall) => {
        let data = {
          country: '',
          number: '',
          direction: '',
          date: '',
          duration: 0,
          cost: 0,
          record: ''
        };
        const country = (pcall.pcall_from_country != "")? pcall.pcall_from_country : pcall.pcall_to_country;
        data.country = 'https://voip-communications.net/countries-flags/' + country + '.png';
        data.direction = (pcall.pcall_from.length > pcall.pcall_to.length)? 'OUT': 'IN';
        data.number = (data.direction == 'OUT')? pcall.pcall_to: pcall.pcall_from;
        data.date = pcall.pcall_date_start;
        data.duration = (pcall.pcall_billed / 60);
        data.cost = (pcall.pcall_sale * 1) + (pcall.pcall_sale_child * 1);
        data.record = pcall.pcall_rec_url;
        this.cdr.push(data);
      });
    })
    .catch();
  }

  makeCall(phoneNumber:string) {

    this.event.publish('callTo',{phoneNumber});
    this.navCtrl.pop();

  }

  sendSMS(phoneNumber:string) {

    this.event.publish('smsTo',{phoneNumber});
    this.navCtrl.parent.select(1);
  }

}
