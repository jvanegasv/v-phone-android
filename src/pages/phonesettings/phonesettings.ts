import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { UserProvider } from '../../providers/user/user';
import { PhoneProvider } from '../../providers/phone/phone';

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

  outbound;
  play_balance = false;
  play_minutes = false;
  countries = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider,
    public phone: PhoneProvider,
    public loadingCtrl: LoadingController) {

      this.outbound = this.user.endpointInfo.outbound.outbound;

  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad PhonesettingsPage');
    this.play_balance = (this.outbound.play_balance == 'Y')? true: false;
    this.play_minutes = (this.outbound.play_minutes == 'Y')? true: false;
    this.countries = await this.user.getCountries();
  }

  async saveChanges(form: NgForm) {

    if (form.valid) {
      const newSettings = {
        endpoint_id: this.user.endpointInfo.endpoint_id,
        play_balance: form.value.play_balance? 'Y' : 'N',
        play_minutes: form.value.play_minutes? 'Y' : 'N',
        play_lang: this.outbound.play_lang,
        rec: form.value.outbound_rec,
        voicemail: this.user.endpointInfo.inbound.inbound.voicemail,
        voicemail_email: this.user.endpointInfo.inbound.inbound.voicemail_email,
        voicemail_pst: this.user.endpointInfo.inbound.inbound.voicemail_pst,
        voicemail_pst_lang: this.user.endpointInfo.inbound.inbound.voicemail_pst_lang,
        voicemail_pst_value: this.user.endpointInfo.inbound.inbound.voicemail_pst_value,
        country: form.value.callAsCountry,
        areacode: form.value.callAsAreaCode,
        callerid: form.value.callAsCallerId
      }

      const loading = this.loadingCtrl.create({
        content: "Saving data, please wait...",
      });
      loading.present();

      await this.phone.setSettings(newSettings);
      await this.user.loadUserInfo();

      loading.dismiss();
      
      this.navCtrl.pop();
    }

  }

}
