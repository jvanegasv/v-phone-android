import { Component } from '@angular/core';
import { Platform, App, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { StoreProvider } from '../providers/store/store';
import { UserProvider } from '../providers/user/user';
import { PhoneProvider } from '../providers/phone/phone';

import { SlidesPage } from '../pages/slides/slides';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { BillingPage } from '../pages/billing/billing';
import { PhonesettingsPage } from '../pages/phonesettings/phonesettings';
import { ChkratesPage } from '../pages/chkrates/chkrates';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private appref: App,
    private menuCtrl: MenuController,
    private store: StoreProvider,
    private user: UserProvider,
    private phone: PhoneProvider) {
    platform.ready().then(() => {

      this.setRootPage().then(() => {
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          statusBar.styleDefault();
          splashScreen.hide();

      })

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

  doLogout() {

    this.phone.logout();
    this.user.logout();
    this.appref.getRootNav().setRoot(LoginPage);
    this.menuCtrl.toggle();
  }

  openPage(pageToOpen: string) {

    switch(pageToOpen) {
      case 'chkrates':
        this.appref.getRootNav().push(ChkratesPage);
        this.menuCtrl.toggle();
        break;
      case 'billing':
        this.appref.getRootNav().push(BillingPage);
        this.menuCtrl.toggle();
        break;
      case 'settings':
        this.appref.getRootNav().push(PhonesettingsPage);
        this.menuCtrl.toggle();
        break;
    }

  }
}
