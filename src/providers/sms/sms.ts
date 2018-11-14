import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the SmsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SmsProvider {

  constructor(public http: HTTP) {
    console.log('Hello SmsProvider Provider');
  }

  getSummary(credentials:any = {}, filter = {}) {

    let promise = new Promise((resolve, reject) => {

      this.http.useBasicAuth(credentials.username, credentials.password);
      this.http.post('https://voip-communications.net/api-v2/index.php/sms/summary',filter,{})
      .then((result) => {
        const data = JSON.parse(result.data);
        if (data.error) {
          reject(data.error_message);
        } else {
          resolve(data.summary);
        }
      })
      .catch((error) => {
        reject('ERROR ' + error.status + ': ' + error.error);
      });

    });

    return promise;
  }

  getChat() {

  }

  sendSms() {

  }

  getSms() {

  }

}
