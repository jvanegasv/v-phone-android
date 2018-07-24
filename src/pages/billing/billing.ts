import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';

import { UserProvider } from '../../providers/user/user';

/**
 * Generated class for the BillingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-billing',
  templateUrl: 'billing.html',
})
export class BillingPage {

  amount;
  billingList = [];
  page = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public user: UserProvider,
    private payPal: PayPal) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BillingPage');
    this.getCurrentBalance();
    this.page = 0;
    this.loadBillingDetail();
  }

  async getCurrentBalance() {

    await this.user.loadUserInfo();

  }

  addFunds(form: NgForm) {

    if (form.valid && this.amount >= 5) {
      this.ppPayment();
    } else {
      const alert = this.alertCtrl.create({
        title: 'ERROR',
        subTitle: 'Amount must be a number greather or equal to 5',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  async ppPayment() {

    // Init paypal
    await this.payPal.init({
      PayPalEnvironmentProduction: 'AVOvJfa8t9xTxk_VDJx43MCxFrDX0knUfKxleF7qZZxgseHXOBw3SfIJYo1MIZUtFMomzSme0_8b--mE',
      PayPalEnvironmentSandbox: 'AZBbSYPJI_Lcl0g1TUOeRSZ27iRuNG5Vppq4Q4KOU_4dLR8o1zHZ7LxkUnvXkWS4n7TXSsl-RAa_tftv'
    });

    // Prepare to render Live/SandBox
    await this.payPal.prepareToRender('PayPalEnvironmentProduction', new PayPalConfiguration({
      // Only needed if you get an "Internal Service Error" after PayPal login!
      //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
    }));

    // Request the payment process
    const payment = new PayPalPayment(this.amount, 'USD', 'Account balance', 'sale');
    let paymentResult = await this.payPal.renderSinglePaymentUI(payment);
    paymentResult.custom = this.user.userInfo.user_id;
    paymentResult.txn_id = paymentResult.response.id;
    paymentResult.payment_gross = this.amount;

    await this.user.recordPayment(paymentResult);
    await this.user.loadUserInfo();
    this.showToast('Thank you for your payment');

  }

  showToast(msg:string) {

    this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    }).present();

  }

  async loadBillingDetail() {

    if (this.page < 0) {
      return;
    }

    const result:any = await this.user.getBillingDetail(this.page);

    if (result.length > 0) {
      this.page++;
    } else {
      this.page = -1;
    }

    result.forEach((data) => {

      let txinfo = {
        date: data.usrbilling_date,
        amount: 0,
        debitcredit: 'X',
        description: data.service_name
      }

      if (data.usrbilling_debit == 0) {
        txinfo.amount = data.usrbilling_credit * 1;
        txinfo.debitcredit = 'Credit';
      } else {
        txinfo.amount = data.usrbilling_debit * 1;
        txinfo.debitcredit = 'Debit';
      }

      this.billingList.push(txinfo)
    });

  }

}
