import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, App } from 'ionic-angular';

import { NgForm } from '@angular/forms';

import { LoginPage } from './../login/login';

import { StoreProvider } from './../../providers/store/store';
import { UserProvider } from './../../providers/user/user';
import { PhoneProvider } from './../../providers/phone/phone';

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
  current_pwd = "";
  pwd1 = "";
  pwd2 = "";
  timezones = [];

  constructor(
    public appref: App,
    public phone: PhoneProvider,
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

  pwdChange = (form: NgForm) => {

    if (form.valid) {
      if (this.pwd1 == this.pwd2) {
        const loading = this.loadingCtrl.create({
          content: "Please wait...",
        });
        loading.present();
        this.user.pwdChange(form.value.current_pwd,form.value.pwd1)
        .then(() => {
          swal({
            type: 'success',
            title: 'Password Changed',
            html: 'Password changed succesfully, please login back'
          });
          this.phone.logout();
          this.user.logout();
          this.appref.getRootNav().setRoot(LoginPage);
        })
        .catch((error) => {
          swal({
            type: 'error',
            title: 'ERROR',
            html: error
          });
        });
        loading.dismiss();
      } else {
        swal({
          type: 'error',
          title: 'ERROR',
          html: 'New password did not match'
        });
        }

    } else {
      let error_msg = 'Please fix the next errors:<br/>';
      error_msg += (form.controls.current_pwd.invalid)? 'Current password is required;<br/>': '';
      error_msg += (form.controls.pwd1.invalid)? 'New password is required, min 8 characters;<br/>': '';
      error_msg += (form.controls.pwd2.invalid)? 'Confirm password is required;<br/>': '';

      swal({
        type: 'error',
        title: 'ERROR',
        html: error_msg
      });
    }
  }

}
