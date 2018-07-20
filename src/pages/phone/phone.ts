import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, ToastController, Events } from 'ionic-angular';

import { PhoneProvider } from '../../providers/phone/phone';
import { UserProvider } from '../../providers/user/user';

/**
 * Generated class for the PhonePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-phone',
  templateUrl: 'phone.html',
})
export class PhonePage {

  plivoOk:boolean = false;
  dialpad:string = "";


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public phone: PhoneProvider,
    public user: UserProvider,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public event: Events) {

      event.subscribe('callTo',(data) => {
        this.dialpad = data.phoneNumber;
        this.callAsnwer();
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhonePage');
    this.initPhone();
  }

  async initPhone() {

    await this.phone.setEndPoint();
    await this.phone.initPlivo(this.user.endpointInfo.username,this.user.endpointInfo.password);
  }

  keypadPress(keyPressed:string) {

    this.dialpad += keyPressed;

    if (this.phone.endpoint.callStatus == "onCall") {
      this.phone.sendDTMF(keyPressed);
    }

  }

  async callAsnwer() {

    //make call
    if (this.phone.endpoint.status == 'offLine') {
      window.location.reload();
      // this.showToast('intentando relogin');
      // await this.initPhone();
    }

    if (this.phone.endpoint.callStatus == "idle") {
      if (this.dialpad !== "") {
        this.phone.makeCall(this.dialpad);
      }
    }

    //answer call
    if (this.phone.endpoint.callStatus == "ringing" && this.phone.endpoint.callDirection == "IN") {
      this.phone.answerCall();
    }

  }

  endReject() {

    //end call
    if (this.phone.endpoint.callStatus == "onCall") {
      this.phone.endCall();
    }

    //reject/cancel call
    if (this.phone.endpoint.callStatus == "ringing") {
      if (this.phone.endpoint.callDirection == "IN") {
        this.phone.rejectCall(); //reject incoming
      }
      else {
        this.phone.endCall(); //cancel outgoing
      }
    }

    this.dialpad = "";

  }

  dialpadBackspace() {

    this.dialpad = this.dialpad.slice(0,-1);

  }

  showToast(msg:string) {

    this.toastCtrl.create({
      message: msg,
      duration: 3000
    }).present();

  }

}
