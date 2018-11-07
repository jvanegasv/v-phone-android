import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { UserProvider } from './../../providers/user/user';
import { PhoneProvider } from './../../providers/phone/phone';
import { StoreProvider } from './../../providers/store/store';

import swal from 'sweetalert2';

/**
 * Generated class for the ChkratesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chkrates',
  templateUrl: 'chkrates.html',
})
export class ChkratesPage {

  countries = [];
  country = "";
  dialpad = "";
  showCard = false;
  quoteResult:any = {};

  constructor(
    public user: UserProvider,
    public phone: PhoneProvider,
    public store: StoreProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad ChkratesPage');
    this.countries = await this.store.getKey('countries');
  }

  checkRate = async () => {

    if (this.dialpad != "") {
      this.showCard = false;

      const loading = this.loadingCtrl.create({
        content: "Please wait...",
      });
      loading.present();

      const quote:any = await this.phone.quote({username: this.user.userInfo.user_api_key, password: this.user.userInfo.user_api_pwd},this.country + this.dialpad);

      loading.dismiss();
      this.showCard = true;

      this.quoteResult = quote;
      this.quoteResult.flag = 'https://voip-communications.net/countries-flags/' + quote.country + '.png';

    } else {
      swal({
        type: 'error',
        title: 'ERROR',
        html: "Phone number is required"
      });
    }

  }

}
