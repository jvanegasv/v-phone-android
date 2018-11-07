import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { NgForm } from '@angular/forms';

import { StoreProvider } from './../../providers/store/store';
import { UserProvider } from './../../providers/user/user';

import swal from 'sweetalert2';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  usr_low_balance = 0;
  timezones = [];

  constructor(
    public user: UserProvider,
    public store: StoreProvider,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
    this.timezones = await this.store.getKey('timezones');
    this.usr_low_balance = Math.floor(this.user.userInfo.user_balance_warning);
  }

  saveChanges = (form: NgForm) => {

    if (form.valid) {
      const loading = this.loadingCtrl.create({
        content: "Please wait...",
      });
      loading.present();
      this.user.profileSave(form.value.usr_fname,form.value.usr_lname,form.value.usr_low_balance,form.value.usr_tz).then().catch((error) => {
        swal({
          type: 'error',
          title: 'ERROR',
          html: error
        });
      });
      loading.dismiss();
    } else {
      let error_msg = 'Please fix the next errors:<br/>';
      error_msg += (form.controls.usr_fname.invalid)? 'First name is required;<br/>': '';
      error_msg += (form.controls.usr_low_balance.invalid)? 'Low balance;<br/>': '';

      swal({
        type: 'error',
        title: 'ERROR',
        html: error_msg
      });
    }

  }

}
