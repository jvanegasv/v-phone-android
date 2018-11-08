import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';

import { StoreProvider } from '../store/store'



/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserProvider {

  public userInfo;
  public endpointInfo;

  constructor(private http: HTTP,
    private store: StoreProvider,
    private device: Device) {
    console.log('Hello UserProvider Provider');
  }

  profileSave(user_fname,user_lname,user_balance_warning,user_timezone) {

    let promise = new Promise((resolve, reject) => {

      this.http.useBasicAuth(this.userInfo.user_api_key,this.userInfo.user_api_pwd);
      this.http.post("https://voip-communications.net/api-v2/index.php/cms/user",{user_id: this.userInfo.user_id,user_fname,user_lname,user_balance_warning,user_timezone},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          reject(data.error_message);
        } else {
          this.loadUserInfo();
          resolve();
        }
      })
      .catch((error) => {
        reject('ERROR ' + error.status + ': ' + error.error);
      });
    });

    return promise;

  }

  pwdChange(password, new_password){

    let promise = new Promise((resolve, reject) => {
      this.http.post("https://voip-communications.net/api-v2/index.php/cms/pwdchange",{username: this.userInfo.user_email,password, new_password},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          reject(data.error_message);
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject('ERROR ' + error.status + ': ' + error.error);
      });
    });

    return promise;
  }

  register(user_fname, user_lname, user_email, user_password) {

    let promise = new Promise((resolve, reject) => {

      this.http.post("https://voip-communications.net/api-v2/index.php/cms/newuser",{user_fname, user_lname, user_email, user_password},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          this.unsetUserEndpointInfo();
          reject(data.error_message);
        } else {
          this.setUserEndpointInfo(data.user,data.endpoint);
          resolve();
        }
      })
      .catch((error) => {
        this.unsetUserEndpointInfo();
        reject('ERROR ' + error.status + ': ' + error.error);
      });
    });

    return promise;

  }

  login(email, password) {

    let promise = new Promise( (resolve,reject) => {

      this.http.post("https://voip-communications.net/api-v2/index.php/cms/login",{'username': email, 'password': password},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          this.unsetUserEndpointInfo();
          reject(data.error_message);
        } else {
          this.setUserEndpointInfo(data.user,data.endpoint);
          this.getMisc();
          resolve();
        }
      })
      .catch((error) => {
        this.unsetUserEndpointInfo();
        reject('ERROR ' + error.status + ': ' + error.error);
      });

    });

    return promise;
  }

  logout() {

    this.unsetUserEndpointInfo();

  }

  async loadUserInfo() {

    const userOnStorage = await this.store.getKey('user');
    if (userOnStorage) {

      this.http.useBasicAuth(userOnStorage.user_api_key,userOnStorage.user_api_pwd);
      await this.http.get('https://voip-communications.net/api-v2/index.php/cms/user',{},{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          this.unsetUserEndpointInfo();
        } else {
          this.setUserEndpointInfo(data.user,data.endpoint);
          this.getMisc();
        }
      })
      .catch((error) => {
        this.unsetUserEndpointInfo();
      });
    } else {
      this.unsetUserEndpointInfo();
    }

  }

  setUserEndpointInfo(user, endpoint) {

    this.userInfo = user;
    this.endpointInfo = endpoint;
    this.store.setKey('user',user);
    this.store.setKey('endpoint',endpoint);

    this.store.getKey('FCMToken').then((data) => {
      this.http.useBasicAuth(this.userInfo.user_api_key,this.userInfo.user_api_pwd);
      this.http.post("https://voip-communications.net/api-v2/index.php/pushnotifications/register",{token: data, platformOS: 'android', platformVersion: this.device.version},{});
    });

  }

  unsetUserEndpointInfo() {

    this.http.useBasicAuth(this.userInfo.user_api_key,this.userInfo.user_api_pwd);
    this.store.getKey('FCMToken').then((data) => {
      this.http.post("https://voip-communications.net/api-v2/index.php/pushnotifications/unregister",{token: data},{});
    });

    this.userInfo = undefined;
    this.endpointInfo = undefined;
    this.store.delKey('user');
    this.store.delKey('endpoint');

  }

  FCMRefresh(token) {

    if (this.userInfo) {
      this.store.getKey('FCMToken').then((data) => {
        this.http.post("https://voip-communications.net/api-v2/index.php/pushnotifications/refresh",{old_token: data, new_token: token},{});
        this.store.setKey('FCMToken',token);
      });
    }

  }

  async recordPayment(paypalResponse:any = {}) {

    await this.http.post('https://voip-communications.net/api-v2/index.php/paypal/payment',paypalResponse,{});
  }

  getBillingDetail(page = 0) {

    let promise = new Promise((resolve, reject) => {

      this.http.useBasicAuth(this.userInfo.user_api_key,this.userInfo.user_api_pwd);
      this.http.get('https://voip-communications.net/api-v2/index.php/ionic/billing/' + page, {}, {})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          reject(data.error_message);
        } else {
          resolve(data.billing);
        }
      })
      .catch((error) => {
        reject('ERROR ' + error.status + ': ' + error.error);
      })
    });

    return promise;
  }

  async getMisc() {

    let countries = [];
    let timezones = [];

    await this.http.get('https://voip-communications.net/api-v2/index.php/ionic/misc',{},{})
    .then((result) => {
      const data = JSON.parse(result.data);

      data.countries.forEach((country) => {
        countries.push({
          code: country.country_code_2,
          name: country.country_name + ' (' + country.country_e164 + ')',
          e164: country.country_e164
        });
      });

      data.timezones.forEach((timezone) => {
        timezones.push({
          tmz_id: timezone.tmz_id,
          tmz_value: timezone.tmz_value
        });
      });

      this.store.setKey('countries',countries);
      this.store.setKey('timezones',timezones);

    });

  }

  registerDevice() {

    const deviceInfo = {
      user_id: this.userInfo.user_id,
      endpoint_id: this.endpointInfo.endpoint_id,
      vphone: '2.0.0',
      cordova: this.device.cordova,
      model: this.device.model,
      platform: this.device.platform,
      uuid: this.device.uuid,
      version: this.device.version,
      manufacturer: this.device.manufacturer,
      isVirtual: this.device.isVirtual,
      serial: this.device.serial
    }

    this.http.useBasicAuth(this.userInfo.user_api_key,this.userInfo.user_api_pwd);
    this.http.post('https://voip-communications.net/api-v2/index.php/ionic/uservphone',deviceInfo,{});
  }
}
