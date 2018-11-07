import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, Events } from 'ionic-angular';

import { PhoneProvider } from '../../providers/phone/phone';
import { UserProvider } from '../../providers/user/user';

import swal from 'sweetalert2';

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
  dialpadShow = true;
  speaker = false;
  mute = false;


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public phone: PhoneProvider,
    public user: UserProvider,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public event: Events) {

      event.subscribe('callTo',(data) => {
        this.dialpad = data.phoneNumber;
        // this.callAsnwer();
      });

      event.subscribe('callTerminated',() => {
        this.resetCallControls();
      });

      event.subscribe('incomingCall',(data) => {
        console.log('llamada entrante');
      });

      this.user.registerDevice();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhonePage');
    this.resetCallControls();
    this.initPhone();
  }

  async initPhone() {

    await this.phone.setEndPoint();
    await this.phone.initPlivo(this.user.endpointInfo.endpoint_username,this.user.endpointInfo.endpoint_pwd);
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
    }

    if (this.phone.endpoint.callStatus == "idle") {
      if (this.dialpad !== "") {
        if (this.user.endpointInfo.outbound.outbound.play_balance == 'Y' || this.user.endpointInfo.outbound.outbound.play_minutes == 'Y') {

          const loading = this.loadingCtrl.create({
            content: "Please wait...",
          });
          loading.present();
          const quote:any = await this.phone.quote({username: this.user.userInfo.user_api_key, password: this.user.userInfo.user_api_pwd},this.dialpad);
          loading.dismiss();

          const alertTitle = "Call to " + this.dialpad + " (" + quote.country_name + ")";
          let alertMsg = "";
          alertMsg += (this.user.endpointInfo.outbound.outbound.play_balance == 'Y')? "Your current balance is $" + quote.balance + ".<br/>": "";
          alertMsg += (this.user.endpointInfo.outbound.outbound.play_minutes == 'Y')? "You have " + quote.mins + " minutes available for this call.<br/>": "";

          const confirmCall:any = await swal({
            imageUrl: 'https://voip-communications.net/countries-flags/' + quote.country + '.png',
            imageWidth: 50,
            title: alertTitle,
            html: alertMsg,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Make the phone call!'
          });

          if (confirmCall.value) {
            this.phone.makeCall(this.dialpad);
            this.dialpadShow = false;
            this.speaker = false;
            this.mute = false;

          }

        } else {
          this.phone.makeCall(this.dialpad);
          this.dialpadShow = false;
          this.speaker = false;
          this.mute = false;
        }
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

    this.resetCallControls();
  }

  dialpadBackspace() {

    this.dialpad = this.dialpad.slice(0,-1);

  }

  dialpadOnOff() {

    console.log('V-PHONE:: Dialpad on/off: ' + this.dialpadShow);
    this.dialpadShow = (this.dialpadShow)? false : true;
  }

  speakerOnOff() {

    console.log('V-PHONE:: Speaker on/off: ' + this.speaker);
    this.speaker = (this.speaker)? false : true;
    this.phone.speakerOnOff(this.speaker);
  }

  muteOnOff() {

    console.log('V-PHONE:: Mute on/off: ' + this.mute);
    this.mute = (this.mute)? false : true;
    this.phone.muteOnOff(this.mute);
  }

  resetCallControls() {

    this.dialpad = "";
    this.dialpadShow = true;
    this.speaker = false;
    this.mute = false;
  }

}
