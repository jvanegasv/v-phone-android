import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { SlidesPage } from '../pages/slides/slides';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { RegisterPage } from '../pages/register/register';
import { PhonePage } from '../pages/phone/phone';
import { SmsPage } from '../pages/sms/sms';
import { ContactsPage } from '../pages/contacts/contacts';
import { PhonelinesPage } from '../pages/phonelines/phonelines';
import { BillingPage } from '../pages/billing/billing';
import { SettingsPage } from '../pages/settings/settings';

import { StoreProvider } from '../providers/store/store';
import { UserProvider } from '../providers/user/user';
import { PhoneProvider } from '../providers/phone/phone';
import { SmsProvider } from '../providers/sms/sms';

import { IonicStorageModule } from '@ionic/storage';
import { HTTP } from '@ionic-native/http';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Contacts } from '@ionic-native/contacts';

import { PhonenumberPipe } from '../pipes/phonenumber/phonenumber';
// import { PipesModule } from '../pipes/pipes.module';


@NgModule({
  declarations: [
    MyApp,
    SlidesPage,
    LoginPage,
    TabsPage,
    RegisterPage,
    PhonePage,
    SmsPage,
    ContactsPage,
    PhonelinesPage,
    BillingPage,
    SettingsPage,
    PhonenumberPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SlidesPage,
    LoginPage,
    TabsPage,
    RegisterPage,
    PhonePage,
    SmsPage,
    ContactsPage,
    PhonelinesPage,
    BillingPage,
    SettingsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StoreProvider,
    UserProvider,
    PhoneProvider,
    SmsProvider,
    HTTP,
    Diagnostic,
    Contacts
  ]
})
export class AppModule {}
