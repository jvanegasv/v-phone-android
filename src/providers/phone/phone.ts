import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

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
    public loadingCtrl: LoadingController
  ) {

    console.log('Hello PhoneProvider Provider');
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
      this.endpoint.status = "onLine";
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Login success");
    });

    //Occurs when a login has failed.cause returns the login failure reason
    this.plivoClient.client.on('onLoginFailed', (cause) => {
      this.endpoint.status = 'offLine';
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Login failed: " + cause);
    });

    //Occurs when a logout is successful
    this.plivoClient.client.on('onLogout',() => {
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
    });

    //Occurs when a call is initiated
    this.plivoClient.client.on('onCalling',() => {

      this.loading = this.loadingCtrl.create({
        content: "Checking connection, please wait...",
      });
      this.loading.present();

      this.endpoint.callStatus = "calling";
      this.endpoint.callDirection = "OUT";
      this.showToast("Calling");

    });

    //Occurs when the remote end starts ringing during an outbound call
    this.plivoClient.client.on('onCallRemoteRinging',() => {

      AudioToggle.setAudioMode(AudioToggle.EARPIECE);

      this.loading.dismiss();

      this.endpoint.callStatus = "ringing";
      this.endpoint.callDirection = "OUT";
      this.showToast("Remote ringing");
    });

    //Occurs when the an outbound call is answered
    this.plivoClient.client.on('onCallAnswered',() => {

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
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Call terminated");
      clearInterval(this.callDurationInterval);
      this.endpoint.callDuration = '0:0:0';
    });

    //Occurs when there is an incoming call. callerID provides the callerID and extraHeaders return the X-Headers from Plivo
    this.plivoClient.client.on('onIncomingCall',(callerID, extraHeaders) => {
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
    });

    //Occurs when an incoming call is cancelled by the caller
    this.plivoClient.client.on('onIncomingCallCanceled',() => {
      this.endpoint.callStatus = "idle";
      this.endpoint.callDirection = "idle";
      this.showToast("Incoming call canceled");
    });


    this.plivoClient.client.on('onWebrtcNotSupported',() => {
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

    // this.showToast('Credentials: ' + username + ' ' + password);
    const micOk = await this.checkDevicePermissions();
    // const micOk = true;
    if (micOk) {
      // this.showToast('Login...');
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

}
