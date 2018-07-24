import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';

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

  constructor(private http: HTTP, private store: StoreProvider) {
    console.log('Hello UserProvider Provider');
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

  }

  unsetUserEndpointInfo() {

    this.userInfo = undefined;
    this.endpointInfo = undefined;
    this.store.delKey('user');
    this.store.delKey('endpoint');

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

}
