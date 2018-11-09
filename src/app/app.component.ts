import { Component } from '@angular/core';
import { Platform, App, MenuController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

import { FCM } from '@ionic-native/fcm';
import { CodePush, InstallMode } from '@ionic-native/code-push';

import { StoreProvider } from '../providers/store/store';
import { UserProvider } from '../providers/user/user';
import { PhoneProvider } from '../providers/phone/phone';

import { SlidesPage } from '../pages/slides/slides';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { PhonesettingsPage } from '../pages/phonesettings/phonesettings';
import { ChkratesPage } from '../pages/chkrates/chkrates';
import { SettingsPage } from '../pages/settings/settings';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage:any;

  iabOptions : InAppBrowserOptions = {
    location : 'yes',//Or 'no'
    hideurlbar: 'yes',
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'no',//Android only ,shows browser zoom controls
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only
    toolbar : 'yes', //iOS only
    enableViewportScale : 'no', //iOS only
    allowInlineMediaPlayback : 'no',//iOS only
    presentationstyle : 'pagesheet',//iOS only
    fullscreen : 'yes',//Windows only
  };

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private appref: App,
    private fcm: FCM,
    private codePush: CodePush,
    public iab: InAppBrowser,
    private menuCtrl: MenuController,
    public alertCtrl: AlertController,
    private store: StoreProvider,
    private user: UserProvider,
    private phone: PhoneProvider) {
    platform.ready().then(() => {

      fcm.subscribeToTopic('all');
      fcm.getToken().then(token=>{
          console.log("FCM: " ,token);
          this.store.setKey('FCMToken',token);
      })
      fcm.onNotification().subscribe(data=>{
        if(data.wasTapped){
          console.log("FCM: Received in background");
        } else {
          console.log("FCM Received in foreground");
        };
      })
      fcm.onTokenRefresh().subscribe(token=>{
        console.log(token);
        this.user.FCMRefresh(token);
      });

      this.setRootPage().then(() => {
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          statusBar.styleDefault();
          splashScreen.hide();

          this.checkCodePush();

      });

    });

    platform.resume.subscribe(() => {
      this.checkCodePush();
    });

  }

  async setRootPage() {

    const skipIntro = await this.store.getKey('skipIntro');
    if (skipIntro === true) {
      const user = await this.store.getKey('user');
      if (user) {
        await this.user.loadUserInfo();
        if (this.user.userInfo) {
          this.rootPage = TabsPage;
        } else {
          this.rootPage = LoginPage;
        }
      } else {
        this.rootPage = LoginPage;
      }
    } else {
      this.rootPage = SlidesPage;
    }
  }

  checkCodePush() {

    this.codePush.sync({
      updateDialog: {
        appendReleaseDescription: true
      },
      installMode: InstallMode.IMMEDIATE
    }).subscribe(
      (data) => {
        console.log('CODE PUSH SUCCESSFUL: ' + data);
      },
      (err) => {
        console.log('CODE PUSH ERROR: ' + err);
        alert('Upadte ERROR: ' + err);
      }
    );
  }

  doLogout() {

    const confirm = this.alertCtrl.create({
      title: 'Logout?',
      message: 'Do you really want to logout?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log('Disagree clicked');
            this.phone.logout();
            this.user.logout();
            this.appref.getRootNav().setRoot(LoginPage);
            this.menuCtrl.toggle();
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('No clicked');
            this.menuCtrl.toggle();
          }
        }
      ]
    });
    confirm.present();

  }

  openPage(pageToOpen: string) {

    switch(pageToOpen) {
      case 'chkrates':
        this.appref.getRootNav().push(ChkratesPage);
        this.menuCtrl.toggle();
        break;
      case 'billing':
        const url = 'https://voip-communications.net/api-v2/index.php/rnpaypal/step1/' + this.user.userInfo.user_api_key + '/' + this.user.userInfo.user_api_pwd;
        let target = "_self";
        this.iab.create(url,target,this.iabOptions);
        this.menuCtrl.toggle();
        break;
      case 'pcallsettings':
        this.appref.getRootNav().push(PhonesettingsPage);
        this.menuCtrl.toggle();
        break;
      case 'profile':
        this.appref.getRootNav().push(SettingsPage);
        this.menuCtrl.toggle();
        break;
    }

  }
}
