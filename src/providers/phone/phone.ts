import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController, Events } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

import { StoreProvider } from '../store/store';

declare var AudioToggle;

/*
  Generated class for the PhoneProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PhoneProvider {

  public loading;
  public callDurationInterval: any;

  public endpoint:any = {
    status:'offLine',
    callStatus: 'idle',
    callDirection:'idle',
    callDuration: '0:0:0'
  }

  public plivoClient:any;

  constructor(private diagnostic: Diagnostic,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private http: HTTP,
    public store: StoreProvider,
    public event: Events
  ) {

    console.log('Hello PhoneProvider Provider');

    this.loading = this.loadingCtrl.create({
      content: "Checking connection, please wait...",
    });

  }

  async setEndPoint() {

    this.plivoClient = undefined;

    let options = {
    "debug":"DEBUG",
    "permOnClick":true,
    "audioConstraints":{"optional":[{"googAutoGainControl":false},{"googEchoCancellation":false}]},
    "enableTracking":true
    };

    this.plivoClient = new window['Plivo'](options);

    //Occurs when a login is successful
    this.plivoClient.client.on('onLogin',() => {
      this.loading.dismiss();
      this.endpoint.status = "onLine";
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Login success");
    });

    //Occurs when a login has failed.cause returns the login failure reason
    this.plivoClient.client.on('onLoginFailed', (cause) => {
      this.loading.dismiss();
      this.endpoint.status = 'offLine';
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Login failed: " + cause);
    });

    //Occurs when a logout is successful
    this.plivoClient.client.on('onLogout',() => {
      this.loading.dismiss();
      this.endpoint.status = "offLine";
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Logout success");
    });

    //Occurs when an outbound call fails. cause returns the reason for call failing
    this.plivoClient.client.on('onCallFailed',(cause) => {
      this.loading.dismiss();
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Call failed: " + cause);
      this.event.publish('callTerminated',{});
    });

    //Occurs when a call is initiated
    this.plivoClient.client.on('onCalling',() => {
      this.loading.present();
      this.endpoint.callStatus = "calling";
      this.endpoint.callDirection = "OUT";
      this.showToast("Calling");

    });

    //Occurs when the remote end starts ringing during an outbound call
    this.plivoClient.client.on('onCallRemoteRinging',() => {
      this.loading.dismiss();
      AudioToggle.setAudioMode(AudioToggle.EARPIECE);
      this.endpoint.callStatus = "ringing";
      this.endpoint.callDirection = "OUT";
      this.showToast("Remote ringing");
    });

    //Occurs when the an outbound call is answered
    this.plivoClient.client.on('onCallAnswered',() => {

      this.loading.dismiss();
      AudioToggle.setAudioMode(AudioToggle.EARPIECE);
      this.endpoint.callStatus = "onCall";
      this.showToast("Call answered");

      const callStartTime = new Date();

      this.callDurationInterval = setInterval(() => {
    			const nowDateTime = new Date();
    			this.endpoint.callDuration = this.callDuration(callStartTime,nowDateTime);
    	}, 1000);

    });

    //Occurs when the an outbound call has ended
    this.plivoClient.client.on('onCallTerminated',() => {
      this.loading.dismiss();
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Call terminated");
      clearInterval(this.callDurationInterval);
      this.endpoint.callDuration = '0:0:0';
      this.event.publish('callTerminated',{});
    });

    //Occurs when there is an incoming call. callerID provides the callerID and extraHeaders return the X-Headers from Plivo
    this.plivoClient.client.on('onIncomingCall',(callerID, extraHeaders) => {
      this.loading.dismiss();
      this.endpoint.callStatus = "ringing";
      this.endpoint.callDirection = "IN";
      console.log("incoming call");
      let confirm = this.alertCtrl.create({
        title: "Incoming Call",
        message: "Incoming call from " + callerID,
        buttons: [
          {
            text: "Reject",
            handler: () => {
              // reject call
              this.rejectCall();
            }
          },
          {
            text: "Answer",
            handler: () => {
              // acept call
              this.answerCall();
            }
          }
        ]
      });
      confirm.present();
      this.event.publish('incomingCall',{});
    });

    //Occurs when an incoming call is cancelled by the caller
    this.plivoClient.client.on('onIncomingCallCanceled',() => {
      this.loading.dismiss();
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Incoming call canceled");
      this.event.publish('callTerminated',{});
    });


    this.plivoClient.client.on('onWebrtcNotSupported',() => {
      this.loading.dismiss();
      this.showToast("webRtc not supported");
    });

  }

  async checkDevicePermissions() {

    let ismicauth = await this.diagnostic.isMicrophoneAuthorized();
    if (!ismicauth) {
      await this.diagnostic.requestMicrophoneAuthorization();
      ismicauth = await this.diagnostic.isMicrophoneAuthorized();
    }

    return ismicauth;

  }

  async initPlivo(username, password) {

    const micOk = await this.checkDevicePermissions();
    if (micOk) {
      this.plivoClient.client.login(username,password);

    }

    return micOk;

  }

  logout() {

    this.plivoClient.client.logout();
    this.plivoClient = undefined;
  }

  makeCall(callTo:string){

    if (this.plivoClient.client.isLoggedIn) {
      let extraHeaders = {'X-PH-Test1': 'test1', 'X-PH-Test2': 'test2'};
      this.plivoClient.client.call(callTo, extraHeaders);
      this.endpoint.callDirection = "OUT";
    }

  }

  answerCall() {

    this.endpoint.callDirection = "IN";
    this.plivoClient.client.answer();

  }

  endCall() {

    this.plivoClient.client.hangup();

  }

  rejectCall() {

    this.plivoClient.client.reject();

  }

  sendDTMF( keyPressed:string) {

    this.plivoClient.client.sendDtmf(keyPressed);

  }

  speakerOnOff(onOff: boolean) {

    if (onOff) {
      AudioToggle.setAudioMode(AudioToggle.SPEAKER);
    } else {
      AudioToggle.setAudioMode(AudioToggle.EARPIECE);
    }
  }

  muteOnOff(onOff: boolean) {

    if (onOff) {
      this.plivoClient.client.mute();
    } else {
      this.plivoClient.client.unmute();
    }
  }

  callDuration(timeStart, timeEnd) {

  		let difference_ms = timeEnd - timeStart;
  		//take out milliseconds
  		difference_ms = difference_ms/1000;
  		let seconds = Math.floor(difference_ms % 60);
  		difference_ms = difference_ms/60;
  		let minutes = Math.floor(difference_ms % 60);
  		difference_ms = difference_ms/60;
  		let hours = Math.floor(difference_ms % 24);
  		// let days = Math.floor(difference_ms/24);

  		return hours+":"+minutes+":"+seconds;

  	}

  showToast(msg:string) {

    this.toastCtrl.create({
      message: msg,
      duration: 3000
    }).present();

  }

  callCdr(credentials:any = {}, filter = {}) {

    let promise = new Promise((resolve, reject) => {

      this.http.useBasicAuth(credentials.username, credentials.password);
      this.http.post('https://voip-communications.net/api-v2/index.php/ionic/callcdr',filter,{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          reject(data.error_message);
        } else {
          resolve(data.cdr);
        }
      })
      .catch((error) => {
        reject('ERROR ' + error.status + ': ' + error.error);
      });

    });

    return promise;

  }

  async setSettings(newSettings:any = {}) {

    await this.http.post('https://voip-communications.net/api-v2/index.php/local/endpointoutbound',newSettings,{})

  }

  quote(credentials:any = {}, callTo) {

    let promise = new Promise((resolve) => {

      this.http.useBasicAuth(credentials.username, credentials.password);
      this.http.get('https://voip-communications.net/api-v2/index.php/ionic/callquote/' + callTo,{},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        resolve(data);
      });

    });

    return promise;
  }

}
