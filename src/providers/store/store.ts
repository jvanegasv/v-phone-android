import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


/*
  Generated class for the StoreProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StoreProvider {

  constructor(private storage: Storage) {
    console.log('Hello StoreProvider Provider');
  }

  async getKey(keyName)  {
    await this.storage.ready();
    let keyValue = await this.storage.get(keyName);
    return keyValue;
  }

  setKey(keyName, keyValue) {
    this.storage.set(keyName,keyValue);
  }

  delKey(keyName) {
    this.storage.remove(keyName);
  }

  clear() {
    this.storage.clear();
  }
}
