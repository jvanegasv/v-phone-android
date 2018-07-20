import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, LoadingController } from 'ionic-angular';

import { Contacts } from '@ionic-native/contacts';

/**
 * Generated class for the ContactsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html',
})
export class ContactsPage {

  public allContacts = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public contacts: Contacts,
    public event: Events,
    public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactsPage');

    const loader = this.loadingCtrl.create({
      content: "Loading contacts information, please wait...",
    });
    loader.present();

    this.contacts.find(['displayName'], {filter: "", multiple: true, desiredFields: ['displayName','phoneNumbers'], hasPhoneNumber: true})
    .then(contactsData => {

      let currentList = [];

      contactsData.forEach((data) => {
        // try {
          let contact = {};
          contact['name']   = data.displayName;
          contact['number'] = data.phoneNumbers[0].value.replace(/\D/g,'');
          currentList.push(contact);
        // } catch(e) {
        //   console.log('VPHONE:: Error on contact information');
        // }
      });

      this.allContacts = this.orderByName(currentList);

      loader.dismiss();
    })
    .catch((error) => {
      loader.dismiss();
    });
  }

  orderByName(list) {

    let newList = list.sort(function(a, b){
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });

    return newList;
  }

  makeCall(phoneNumber:string) {

    this.event.publish('callTo',{phoneNumber});
    this.navCtrl.parent.select(0);

  }

  sendSMS(phoneNumber:string) {

    this.event.publish('smsTo',{phoneNumber});
    this.navCtrl.parent.select(1);
  }

}
