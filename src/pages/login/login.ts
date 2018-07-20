import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { RegisterPage } from '../register/register';
import { TabsPage } from '../tabs/tabs';

import { UserProvider } from '../../providers/user/user'

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email;
  password;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  goToRegister() {

    this.navCtrl.push(RegisterPage);
  }

  doLogin(form: NgForm) {

    console.log(form);
    if (form.valid) {
      const loader = this.loadingCtrl.create({
        content: "Please wait...",
      });
      loader.present();

      this.user.login(this.email, this.password)
      .then(() => {

        loader.dismiss();
        this.navCtrl.setRoot(TabsPage);
        this.navCtrl.popToRoot();
      })
      .catch((error) => {

        loader.dismiss();
        const alert = this.alertCtrl.create({
          title: 'ERROR',
          subTitle: error,
          buttons: ['OK']
        });
        alert.present();
      });

    } else {
      let error_msg = 'Please fix the next errors:';
      error_msg += (form.controls.email.invalid)? ' Enter a valid email address;': '';
      error_msg += (form.controls.password.invalid)? ' Password is required;': '';
      const alert = this.alertCtrl.create({
        title: 'ERROR',
        subTitle: error_msg,
        buttons: ['OK']
      });
      alert.present();
    }

  }

}
