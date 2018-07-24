import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the PlayphonerecPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-playphonerec',
  templateUrl: 'playphonerec.html',
})
export class PlayphonerecPage {

  pcall:any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {

      this.pcall = this.navParams.get('pcall');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlayphonerecPage');
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
