import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { NgForm } from '@angular/forms';

import { TabsPage } from '../tabs/tabs';

import { UserProvider } from '../../providers/user/user';

import swal from 'sweetalert2';

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  user_fname;
  user_lname;
  user_email;
  user_pwd;
  user_pwd2;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public user: UserProvider,
    public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  returnToLogin() {

    this.navCtrl.pop();
  }

  register(form: NgForm) {

    if (form.valid) {

      if (this.user_pwd != this.user_pwd2) {
        this.showSwal("error","Oops...","Password didn't match");
        return;
      }

      const loader = this.loadingCtrl.create({
        content: "Please wait...",
      });
      loader.present();

      this.user.register(this.user_fname,this.user_lname,this.user_email,this.user_pwd)
      .then(() => {

        loader.dismiss();
        this.navCtrl.setRoot(TabsPage);
        this.navCtrl.popToRoot();

      })
      .catch((error) => {

        loader.dismiss();
        this.showSwal("error","ERROR",error);
      });

    } else {
      let error_msg = 'Please fix the next errors:<br/>';
      error_msg += (form.controls.user_fname.invalid)? 'First name is required;<br/>': '';
      error_msg += (form.controls.user_lname.invalid)? 'Last name is required;<br/>': '';
      error_msg += (form.controls.user_email.invalid)? 'Enter a valid email address;<br/>': '';
      error_msg += (form.controls.user_pwd.invalid)? 'Password is required;<br/>': '';
      error_msg += (form.controls.user_pwd2.invalid)? 'Password confirmation is required;<br/>': '';
      this.showSwal('error','Oops...',error_msg);
    }

  }

  showSwal(swalType, swalTitle, swalHtml) {

    swal({
      type: swalType,
      title: swalTitle,
      html: swalHtml
    });

  }

}
